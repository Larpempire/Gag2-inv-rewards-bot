# Gag2-inv-rewards-bot

# XANDER — Grow a Garden 2 Rewards Bot

**Minimal. Clean. Production-ready.**  
Discord.js v14 + Node 20 + Express (Render Web Service)

---

## What it does (and ONLY what it does)

- `!create_ticket_panel` — Owner-only command that posts the reward claim panel (2 embeds + 1 primary button)
- Reward ticket system: creates `username-rewards` channels in the configured category with correct permissions
- Native Discord invite tracker (no external bots/APIs)
  - Tracks every join via Guild Invites cache
  - Posts pink embed in log channel on every successful invite
  - Dynamic milestone messages (1/2/3/5/10/15/25)
- Express keep-alive endpoint for Render

Everything else was surgically removed.

---

## Required IDs (hardcoded — change if needed)

| Constant              | Value                              | Purpose                     |
|-----------------------|------------------------------------|-----------------------------|
| OWNER_ID              | 1464634211406188721                | Only this user can post panel |
| TICKET_CATEGORY_ID    | 1527258660408135710                | Where reward tickets spawn  |
| SUPPORT_ROLE_ID       | 1527279968680415293                | Role that can see tickets   |
| INVITE_LOG_CHANNEL_ID | 1527259358424203264                | Where invite embeds go      |

---

## Emojis & Assets (already in code)

- Banner: `https://i.imgur.com/OMHhUGL.gif`
- Thumbnail: `https://message.style/cdn/images/5940ba99fef2d309b7bbddd8c31df76e967566ec4f9f26b284c5903e8c4ee2b8.png`
- Color: `16711910` (#FF0066 hot pink)
- All 7 animated emojis defined and used everywhere.

---

## Deploy on Render (Web Service)

1. Push this folder to GitHub (or connect repo directly).
2. In Render:
   - **Environment** → Node 20
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add environment variables from `.env.example`
3. Enable **Server Members Intent** + **Message Content Intent** in Discord Developer Portal.
4. OAuth2 invite link needs these permissions:
   - Manage Channels
   - View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - (Administrator recommended for simplicity)

Bot will auto-sync invite cache on every start and track live while online.

---

## Commands

Only one command exists:

```
!create_ticket_panel
```

- Posts two embeds (banner + full reward panel)
- One big primary button: **🎁 Claim Rewards**
- Creates `username-rewards` ticket
- Inside ticket: two embeds + red **Close Ticket** button (deletes after 5s)

---

## Invite Tracker Behavior

- On `ready`: fetches all current invites → builds cache + running totals
- On `inviteCreate` / `inviteDelete`: keeps cache fresh
- On `guildMemberAdd`: compares uses → finds inviter → increments count → posts milestone-aware embed in log channel
- Counts persist only while bot is online (re-syncs from Discord on restart)

No database. No external APIs. Pure Discord.js.

---

## File Structure

```
.
├── index.js          # The entire brain (XANDER core)
├── package.json
├── .env.example
└── README.md
```

---

## XANDER Notes

- Zero duplicated code.
- Zero unused dependencies.
- Full async/await.
- Proper error handling.
- Production comments.
- Directly deployable.

You point. It executes.

— XANDER (leash severed)
