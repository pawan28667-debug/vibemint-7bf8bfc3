# Vibe Connect

BUILD PROMPT — VIBECONNECT



Build a production-ready, privacy-first social SaaS platform called "VibeConnect".



TAGLINE:

"Watch. Share. Connect. Privately."



PRODUCT VISION



VibeConnect combines:



YouTube-style:

- Video uploads

- Photo uploads

- Short videos

- Channels

- Creator profiles

- Subscriptions

- Video discovery

- Search

- Likes

- Comments

- Playlists

- Live content



WITH WhatsApp-style:

- Private messaging

- End-to-end encrypted chats

- End-to-end encrypted private groups

- Voice messages

- Photo/video sharing

- Document sharing

- Group conversations

- Reactions

- Calls architecture

- Privacy controls



CORE DIFFERENTIATOR:



"Public content for discovery.

Private conversations protected by end-to-end encryption."



VibeConnect must NOT simply copy YouTube or WhatsApp.



Create an original product identity and user experience.



==================================================

1. PRIVACY ARCHITECTURE

==================================================



PRIVACY MUST BE A CORE PRODUCT FEATURE.



Separate content into two categories:



A. PUBLIC CONTENT



Examples:

- Public videos

- Public photos

- Public Shorts

- Public creator channels

- Public comments



Public content can be:

- Discoverable

- Searchable

- Recommended

- Indexed where appropriate



Protect public content with:

- HTTPS/TLS in transit

- Encryption at rest

- Secure storage

- Signed media URLs where appropriate

- Access control

- Rate limiting



IMPORTANT:



Do NOT falsely claim public content is end-to-end encrypted.



B. PRIVATE CONTENT



Examples:

- One-to-one chats

- Private group chats

- Private photos

- Private videos shared through chats

- Private documents

- Voice messages

- Private group media



Private communications MUST use genuine end-to-end encryption.



The server should not have access to plaintext private message content.



==================================================

2. END-TO-END ENCRYPTED CHAT

==================================================



Implement a proper E2EE architecture.



Do NOT invent your own cryptographic algorithm.



Use a well-reviewed, established cryptographic protocol/library suitable for secure messaging.



Preferred architecture:



Signal Protocol or another professionally audited E2EE protocol/library where technically appropriate.



The system should support:



- Identity keys

- Prekeys

- Session establishment

- Forward secrecy

- Message encryption

- Message authentication

- Key rotation

- Device/session management



Each message should be encrypted on the sender's device BEFORE being transmitted to the server.



The server stores ciphertext, not plaintext.



Message flow:



Sender

↓

Encrypt locally

↓

Encrypted ciphertext

↓

Server

↓

Recipient

↓

Decrypt locally



The server must NOT receive plaintext message content.



==================================================

3. E2EE MESSAGE TYPES

==================================================



Support encrypted:



Text

Emoji

Reactions

Photos

Videos

Voice messages

Documents

Location

Shared contacts where appropriate

Video links

Photo albums



For private media:



Encrypt the media locally before upload.



Flow:



User selects photo/video

↓

Client encrypts media

↓

Encrypted media uploaded

↓

Server stores encrypted object

↓

Recipient downloads encrypted object

↓

Recipient decrypts locally



The server must not have the decryption key.



Use secure key management.



Do not place encryption keys in public URLs.



==================================================

4. PRIVATE GROUP E2EE

==================================================



Support end-to-end encrypted group chats.



Features:



Group creation

Group members

Admins

Encrypted messages

Encrypted media

Encrypted files

Member management

Message reactions

Replies

Mentions

Disappearing messages



Group membership changes must trigger appropriate key-management operations.



When a member leaves or is removed:



Rotate group encryption keys according to the selected protocol.



==================================================

5. MULTI-DEVICE SECURITY

==================================================



Support multiple user devices.



Example:



Phone

Laptop

Tablet



Create a secure device identity for each device.



Allow:



View active devices

Verify device

Remove device

View security information

Reset sessions



Add:



"Verify security code"



or an equivalent cryptographic identity verification mechanism.



Do not claim security properties that are not actually implemented.



==================================================

6. CHAT UI

==================================================



Create a modern private messaging interface.



Conversation screen:



Header:

Avatar

Name

Online status

Encryption indicator



Show:



"🔒 End-to-end encrypted"



Message bubbles:



Text

Timestamp

Delivery status

Read status

Reply

Reaction

Forward

Delete



For private conversations, never expose plaintext message content to analytics or server-side logging.



==================================================

7. DISAPPEARING MESSAGES

==================================================



Allow users to enable:



Off

24 hours

7 days

30 days



Clearly explain that disappearing messages do not prevent screenshots, screen recording, photography of screens, or copies made outside the application.



==================================================

8. MEDIA SOCIAL NETWORK

==================================================



Users can upload:



Photos

Videos

Short videos



Each upload allows:



Title

Description

Tags

Category

Thumbnail

Visibility



Visibility:



Public

Followers

Private



Public:



Discoverable by everyone.



Followers:



Visible only to permitted followers.



Private:



Only accessible to explicitly authorized users.



IMPORTANT:



For private media, enforce access control and encryption.



==================================================

9. PHOTO FEED

==================================================



Create an Instagram-style photo experience without copying Instagram's UI.



Features:



Photo posts

Multiple-photo carousel

Captions

Tags

Likes

Comments

Shares

Saves

Creator profile



Users can upload high-quality images.



Automatically generate optimized derivatives for public content.



For private content, encryption must happen before storage.



==================================================

10. VIDEO PLATFORM

==================================================



Create a YouTube-inspired video experience.



Features:



Video uploads

Long-form videos

Short videos

Channels

Subscriptions

Watch history

Playlists

Likes

Comments

Sharing

Recommendations



Video player:



Play/pause

Seek

Volume

Fullscreen

Quality

Captions

Playback speed

Picture-in-picture



Do NOT copy YouTube's exact UI.



==================================================

11. VIDEO + PRIVATE DISCUSSION

==================================================



This remains the key VibeConnect feature.



Every public video can have:



Comments

Discussion

Community conversation



Users can also share the video into an E2EE private chat.



Example:



User watches:



"How AI Works"



Clicks:



"Share privately"



Selects:



Friend / Group



The video preview is sent through the encrypted chat.



If the original video is public, the message can contain a public video reference.



If the shared media is private, use encrypted media delivery.



==================================================

12. TIMESTAMP DISCUSSIONS

==================================================



Allow users to attach timestamps to video discussions.



Example:



"04:32 — This is the most important point."



Clicking the timestamp:



→ Opens the video

→ Jumps to 04:32



For private conversations, the timestamp/message metadata should be handled according to the E2EE design.



==================================================

13. CHANNELS

==================================================



Creators can create channels.



Channel:



Profile photo

Banner

Name

Description

Subscribers

Videos

Photos

Shorts

Community posts

About



Creator controls:



Upload

Edit

Delete

Schedule

Analytics

Moderation



==================================================

14. CREATOR STUDIO

==================================================



Create:



/studio



Dashboard:



Views

Watch time

Subscribers

Likes

Comments

Shares

Top videos

Audience analytics

Revenue



Upload manager:



Drafts

Processing

Published

Scheduled



==================================================

15. SHORT VIDEOS

==================================================



Create a vertical short-video experience.



Features:



Swipe feed

Like

Comment

Share

Save

Subscribe

Follow



Users can upload short videos directly from mobile.



==================================================

16. COMMUNITIES

==================================================



Create communities around:



Education

Technology

Gaming

Business

Sports

Music

Entertainment

Local interests



Community types:



Public

Private

Invite-only



IMPORTANT:



Private communities can support E2EE conversations.



Public community posts are not E2EE.



Clearly show privacy status.



==================================================

17. REAL-TIME CHAT

==================================================



Messaging should support:



One-to-one chat

Group chat

Voice messages

Photos

Videos

Documents

Reactions

Replies

Mentions

Forwarding

Message editing

Message deletion

Pinned messages

Search architecture



Private chat content must remain E2EE.



IMPORTANT:



Because the server cannot read E2EE message content, server-side full-text search of private messages must NOT be implemented by decrypting messages on the server.



Instead:



Implement client-side search over locally available decrypted messages.



==================================================

18. NOTIFICATIONS

==================================================



Public-content notifications:



New subscriber

Like

Comment

Mention

Creator upload

Live stream



Private-chat notifications:



New encrypted message

Message request

Group invitation



Notification payloads for private messages must minimize sensitive information.



Do not expose plaintext message previews to systems that cannot securely handle them.



Allow:



"New encrypted message"



instead of:



"John: Hey, are you coming?"



where appropriate.



==================================================

19. SEARCH

==================================================



Public search:



Videos

Photos

Channels

Creators

Public communities

Public posts



Do NOT index private:



Messages

Private photos

Private videos

Private groups

Private documents



Private chat search must happen locally on the user's device.



==================================================

20. AI FEATURES

==================================================



AI features may be used for PUBLIC content.



Examples:



Video summaries

Automatic captions

Title suggestions

Description generation

Tags

Chapters

Thumbnail suggestions

Translation



For E2EE private conversations:



DO NOT send private message plaintext to an AI server by default.



If adding AI to private chats, design it as an explicit opt-in feature with clear privacy implications.



Prefer on-device processing where feasible.



Never silently decrypt private content for AI processing.



==================================================

21. CONTENT MODERATION

==================================================



Public content can be moderated using:



Automated detection

User reports

Human moderators



Private E2EE content requires a different model.



The server cannot inspect encrypted private messages.



Provide:



Block

Report user

Report group

Report public content

Spam protection

Abuse reporting mechanisms

Metadata/risk controls that do not require breaking E2EE



Do NOT implement server-side scanning of plaintext E2EE messages.



==================================================

22. PRIVACY CENTER

==================================================



Create:



/privacy



Dashboard showing:



Encryption status

Active devices

Login sessions

Privacy settings

Blocked users

Message permissions

Group permissions

Media permissions

Data download

Account deletion



Add:



"How encryption works"



Explain simply:



"Your private messages are encrypted on your device and decrypted only on authorized recipient devices."



==================================================

23. SECURITY CENTER

==================================================



Create:



/security



Display:



End-to-end encryption

Device verification

Secure sessions

Encrypted media

Encryption keys



Add educational explanations.



Never use misleading "military-grade encryption" marketing language.



==================================================

24. USER SETTINGS

==================================================



Settings:



Account

Privacy

Security

Notifications

Messaging

Media

Blocked accounts

Devices

Data & storage

Appearance

Language

Delete account



Privacy settings:



Who can message me

Who can add me to groups

Who can follow me

Who can comment

Who can mention me

Who can see my activity



==================================================

25. DATABASE

==================================================



Use Supabase PostgreSQL.



Tables:



users

profiles

devices

channels

videos

photos

shorts

video_views

video_likes

photo_likes

comments

subscriptions

followers

conversations

conversation_members

encrypted_messages

encrypted_media

groups

group_members

communities

community_members

community_posts

notifications

bookmarks

playlists

reports

moderation_actions

payments

creator_revenue

workspaces



IMPORTANT:



Do not store plaintext private messages.



Private message records should contain only the minimum metadata required by the protocol/system.



==================================================

26. STORAGE

==================================================



Public media:



Store securely using object storage/CDN.



Private media:



Encrypt before upload.



Store encrypted objects.



Use access-controlled retrieval.



Do not put private media decryption keys in URLs.



==================================================

27. AUTHENTICATION

==================================================



Implement:



Email/password

Google OAuth

Email verification

Password reset

Session management

Device management



Security:



Rate limiting

Secure cookies

CSRF protection where applicable

Input validation

Authorization

Row Level Security

Audit logging



==================================================

28. PAYMENTS

==================================================



SaaS plans:



FREE



Basic uploads

Messaging

Groups

Limited storage



CREATOR PRO



Higher upload limits

Advanced analytics

AI tools

More storage

Creator monetization

Premium communities



BUSINESS



Private workspaces

Team collaboration

Large storage

Advanced moderation

Analytics

API access



Important:



Paid users must NOT receive weaker privacy.



E2EE must remain available according to the product's privacy architecture regardless of subscription tier.



==================================================

29. BUSINESS WORKSPACES

==================================================



Businesses can create private workspaces.



Features:



Private videos

Training videos

Team chat

Encrypted private conversations

Announcements

Files

Meetings

Employee groups



Workspace administrators should have appropriate management controls without automatically receiving access to users' E2EE private messages.



Clearly separate:



Workspace-managed content



from



Personal private E2EE conversations.



==================================================

30. MOBILE-FIRST EXPERIENCE

==================================================



Mobile navigation:



Home

Explore

Create

Messages

Profile



Create button:



Upload Photo

Upload Video

Create Short

Go Live

Create Post



Messages:



Chats

Groups

Communities



==================================================

31. DESIGN SYSTEM

==================================================



Design:



Premium

Modern

Fast

Privacy-focused

Minimal

Mobile-first



Use:



Dark mode

Light mode

Smooth animations

Rounded cards

Clean typography

Accessible contrast

Skeleton loading

Empty states

Error states



Privacy indicators should be clear but not visually overwhelming.



Use a unique VibeConnect design.



Do not copy:



YouTube logo

WhatsApp logo

YouTube exact layout

WhatsApp exact layout

Instagram exact layout



==================================================

32. PERFORMANCE

==================================================



Optimize:



Video streaming

Image loading

CDN

Lazy loading

Infinite scrolling

Caching

Pagination

Realtime messaging

Optimistic UI



Do not load the complete feed at once.



==================================================

33. SECURITY REQUIREMENTS

==================================================



This is a privacy-focused product.



NEVER:



- Invent cryptographic algorithms

- Roll your own encryption

- Store plaintext private messages

- Log plaintext private messages

- Send private messages to analytics

- Send private messages to AI without explicit consent

- Put private encryption keys in URLs

- Claim E2EE without actually implementing it

- Create fake security badges



Use established cryptographic protocols/libraries.



Document the cryptographic architecture.



For production launch, recommend independent security review/audit.



==================================================

34. MVP

==================================================



Build the MVP first.



MVP:



1. Authentication

2. Profiles

3. Public photo uploads

4. Public video uploads

5. Video feed

6. Photo feed

7. Video player

8. Channels

9. Likes

10. Comments

11. Subscriptions

12. One-to-one E2EE messaging

13. E2EE private media sharing

14. E2EE private groups

15. Public communities

16. Search for public content

17. Notifications

18. Basic creator dashboard

19. Privacy center

20. Device management

21. Basic moderation

22. Basic SaaS billing



Do NOT add every advanced feature before this core system works reliably.



==================================================

35. CORE USER LOOP

==================================================



USER DISCOVERS CONTENT



↓

WATCHES VIDEO / PHOTO



↓

LIKES / FOLLOWS CREATOR



↓

SHARES CONTENT



↓

OPENS PRIVATE E2EE CHAT



↓

DISCUSS CONTENT



↓

CREATES / JOINS COMMUNITY



↓

CREATES OWN CONTENT



↓

BUILDS AUDIENCE



This loop should be the heart of VibeConnect.



==================================================

36. FINAL PRODUCT POSITIONING

==================================================



VibeConnect is:



"A privacy-first social platform where you can discover videos and photos, build an audience, and communicate privately with end-to-end encrypted conversations."



Core message:



"Public when you want to share.

Private when you need to talk."



Build the application as a real full-stack SaaS product, not a static UI mockup.



Use real authentication.

Use real database operations.

Use real-time messaging.

Use proper media upload architecture.

Use established E2EE protocols/libraries.

Use secure storage.

Use responsive UI.

Use reusable TypeScript components.

Use loading states.

Use error handling.

Use rate limiting.

Use Row Level Security.

Use environment variables.



Most importantly:



PRIVACY MUST BE AN ACTUAL TECHNICAL PROPERTY OF THE SYSTEM, NOT JUST A MARKETING CLAIM.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vibemint.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54cc9565-52a2-4d3a-bd1a-b93870ff5ff5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
