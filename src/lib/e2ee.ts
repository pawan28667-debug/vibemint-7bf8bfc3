/**
 * VibeConnect end-to-end encryption (browser only).
 *
 * Design (Signal-inspired, honest about what it is):
 *  - Every device generates a long-lived ECDH P-256 identity keypair. The private
 *    key is a non-extractable WebCrypto key stored in IndexedDB — it never leaves
 *    the device and cannot be read by JavaScript, the server, or Lovable Cloud.
 *  - Only the public key is published to the device directory.
 *  - Every message uses a fresh ephemeral keypair (X3DH-style sender ratchet step).
 *    shared = ECDH(ephemeral_priv, recipient_identity_pub)
 *    key    = HKDF-SHA256(shared, salt = ephPub || recipientPub, info = "vibeconnect-msg-v1")
 *    body   = AES-256-GCM(key, iv, plaintext)
 *  - One ciphertext row is written per recipient device (multi-device fan-out),
 *    including the sender's own other devices.
 *  - The server only ever stores ciphertext, an IV and an ephemeral public key.
 */

const DB_NAME = "vibeconnect-e2ee";
const STORE = "keys";
const IDENTITY_KEY = "identity-v1";
const DEVICE_ROW_KEY = "device-row-v1";

export type IdentityKeyPair = { publicKey: CryptoKey; privateKey: CryptoKey };

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    tx.onsuccess = () => resolve(tx.result as T | undefined);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
    tx.onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
    tx.onsuccess = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of view) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/** Returns this device's identity keypair, generating and persisting it on first use. */
export async function getIdentityKeyPair(): Promise<IdentityKeyPair> {
  const existing = await idbGet<IdentityKeyPair>(IDENTITY_KEY);
  if (existing?.privateKey && existing?.publicKey) return existing;

  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false, // private key is NOT extractable
    ["deriveBits"],
  );
  const stored: IdentityKeyPair = { publicKey: pair.publicKey, privateKey: pair.privateKey };
  await idbSet(IDENTITY_KEY, stored);
  return stored;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  return toBase64(await crypto.subtle.exportKey("raw", key));
}

async function importPublicKey(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    fromBase64(raw) as unknown as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

/** Short human-comparable fingerprint of a public key (Signal's "safety number"). */
export async function safetyNumber(publicKeyB64: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", fromBase64(publicKeyB64) as unknown as BufferSource);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return (hex.match(/.{1,5}/g) ?? []).slice(0, 6).join(" ").toUpperCase();
}

async function deriveMessageKey(
  privateKey: CryptoKey,
  peerPublicRaw: string,
  ephemeralPublicRaw: string,
  recipientPublicRaw: string,
): Promise<CryptoKey> {
  const peerPublic = await importPublicKey(peerPublicRaw);
  const shared = await crypto.subtle.deriveBits(
    { name: "ECDH", public: peerPublic },
    privateKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  const salt = new Uint8Array([...fromBase64(ephemeralPublicRaw), ...fromBase64(recipientPublicRaw)]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt as unknown as BufferSource,
      info: new TextEncoder().encode("vibeconnect-msg-v1") as unknown as BufferSource,
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export type Sealed = { ephemeral_pub: string; ciphertext: string; iv: string };

/** Encrypts a plaintext payload to one recipient device public key. */
export async function sealTo(recipientPublicRaw: string, plaintext: string): Promise<Sealed> {
  const ephemeral = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const ephemeralPub = await exportPublicKey(ephemeral.publicKey);
  const key = await deriveMessageKey(
    ephemeral.privateKey,
    recipientPublicRaw,
    ephemeralPub,
    recipientPublicRaw,
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    new TextEncoder().encode(plaintext) as unknown as BufferSource,
  );
  return { ephemeral_pub: ephemeralPub, ciphertext: toBase64(cipher), iv: toBase64(iv) };
}

/** Decrypts a ciphertext addressed to this device. */
export async function openSealed(sealed: Sealed): Promise<string> {
  const identity = await getIdentityKeyPair();
  const myPub = await exportPublicKey(identity.publicKey);
  const key = await deriveMessageKey(
    identity.privateKey,
    sealed.ephemeral_pub,
    sealed.ephemeral_pub,
    myPub,
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(sealed.iv) as unknown as BufferSource },
    key,
    fromBase64(sealed.ciphertext) as unknown as BufferSource,
  );
  return new TextDecoder().decode(plain);
}

export async function getStoredDeviceId(): Promise<string | undefined> {
  return idbGet<string>(DEVICE_ROW_KEY);
}

export async function setStoredDeviceId(id: string): Promise<void> {
  await idbSet(DEVICE_ROW_KEY, id);
}

/** Wipes this device's keys. Existing messages become unreadable here. */
export async function wipeDeviceKeys(): Promise<void> {
  await idbDelete(IDENTITY_KEY);
  await idbDelete(DEVICE_ROW_KEY);
}
