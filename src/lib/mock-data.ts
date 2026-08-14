export type Visibility = "public" | "followers" | "private";

export type Creator = {
  id: string;
  name: string;
  handle: string;
  hue: number;
  subscribers: string;
  verified?: boolean;
};

export type VideoPost = {
  id: string;
  title: string;
  creatorId: string;
  views: string;
  age: string;
  duration: string;
  hue: number;
  category: string;
  visibility: Visibility;
};

export type PhotoPost = {
  id: string;
  caption: string;
  creatorId: string;
  likes: number;
  comments: number;
  frames: number;
  hue: number;
  visibility: Visibility;
};

export type Short = {
  id: string;
  title: string;
  creatorId: string;
  likes: string;
  comments: string;
  hue: number;
};

export type ChatThread = {
  id: string;
  name: string;
  kind: "direct" | "group";
  preview: string;
  time: string;
  unread: number;
  hue: number;
  members?: number;
};

export const creators: Creator[] = [
  { id: "c1", name: "Ananya Iyer", handle: "@ananyabuilds", hue: 42, subscribers: "482K", verified: true },
  { id: "c2", name: "Studio Kalaa", handle: "@studiokalaa", hue: 278, subscribers: "1.2M", verified: true },
  { id: "c3", name: "Rohit Deshmukh", handle: "@rohitcooks", hue: 18, subscribers: "96K" },
  { id: "c4", name: "Meher Qureshi", handle: "@meherframes", hue: 168, subscribers: "233K", verified: true },
  { id: "c5", name: "Table for Two", handle: "@tablefortwo", hue: 88, subscribers: "51K" },
];

export const creatorById = (id: string) => creators.find((c) => c.id === id)!;

export const videos: VideoPost[] = [
  {
    id: "v1",
    title: "How end-to-end encryption actually works, explained with envelopes",
    creatorId: "c1",
    views: "312K views",
    age: "2 days ago",
    duration: "14:08",
    hue: 42,
    category: "Technology",
    visibility: "public",
  },
  {
    id: "v2",
    title: "Block printing in Bagru — a full day at the workshop",
    creatorId: "c2",
    views: "1.1M views",
    age: "1 week ago",
    duration: "22:41",
    hue: 278,
    category: "Craft",
    visibility: "public",
  },
  {
    id: "v3",
    title: "Sunday breakfast: three ways with leftover rice",
    creatorId: "c3",
    views: "88K views",
    age: "4 hours ago",
    duration: "08:12",
    hue: 18,
    category: "Food",
    visibility: "public",
  },
  {
    id: "v4",
    title: "Shooting monsoon light on a 20-year-old lens",
    creatorId: "c4",
    views: "204K views",
    age: "3 days ago",
    duration: "11:57",
    hue: 168,
    category: "Photography",
    visibility: "public",
  },
  {
    id: "v5",
    title: "Team retro — Q3 launch notes",
    creatorId: "c5",
    views: "12 viewers",
    age: "yesterday",
    duration: "31:20",
    hue: 88,
    category: "Workspace",
    visibility: "private",
  },
];

export const photos: PhotoPost[] = [
  { id: "p1", caption: "Indigo drying in the courtyard, Bagru", creatorId: "c2", likes: 12480, comments: 214, frames: 4, hue: 278, visibility: "public" },
  { id: "p2", caption: "Second cup, first light", creatorId: "c4", likes: 3421, comments: 58, frames: 1, hue: 168, visibility: "public" },
  { id: "p3", caption: "Marigold season at the flower market", creatorId: "c1", likes: 8790, comments: 132, frames: 3, hue: 42, visibility: "public" },
  { id: "p4", caption: "Family album — Diwali 2025", creatorId: "c3", likes: 0, comments: 0, frames: 12, hue: 18, visibility: "private" },
];

export const shorts: Short[] = [
  { id: "s1", title: "One minute: what a verification code proves", creatorId: "c1", likes: "24K", comments: "310", hue: 42 },
  { id: "s2", title: "Carving a wooden print block", creatorId: "c2", likes: "112K", comments: "1.4K", hue: 278 },
  { id: "s3", title: "Filter coffee, no shortcuts", creatorId: "c3", likes: "9.8K", comments: "204", hue: 18 },
  { id: "s4", title: "Golden hour in 45 seconds", creatorId: "c4", likes: "41K", comments: "622", hue: 168 },
];

export const threads: ChatThread[] = [
  { id: "t1", name: "Ananya Iyer", kind: "direct", preview: "New encrypted message", time: "09:14", unread: 2, hue: 42 },
  { id: "t2", name: "Bagru Trip 🧵", kind: "group", preview: "New encrypted message", time: "08:52", unread: 6, hue: 278, members: 9 },
  { id: "t3", name: "Meher Qureshi", kind: "direct", preview: "Shared a video · 04:32", time: "Yesterday", unread: 0, hue: 168 },
  { id: "t4", name: "Family", kind: "group", preview: "New encrypted message", time: "Yesterday", unread: 0, hue: 18, members: 5 },
  { id: "t5", name: "Table for Two — Workspace", kind: "group", preview: "New encrypted message", time: "Mon", unread: 0, hue: 88, members: 14 },
];

export const communities = [
  { id: "g1", name: "Makers of India", members: "128K", privacy: "Public", hue: 42, topic: "Craft & Design" },
  { id: "g2", name: "Privacy Nerds", members: "34K", privacy: "Public", hue: 168, topic: "Technology" },
  { id: "g3", name: "Sunday Cooks", members: "62K", privacy: "Invite-only", hue: 18, topic: "Food" },
  { id: "g4", name: "Frames & Grain", members: "19K", privacy: "Private", hue: 278, topic: "Photography" },
];
