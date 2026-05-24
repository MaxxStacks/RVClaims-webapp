# DS360 Assist — AI Agent & Remote Support Spec

**Version:** 1.0  
**Date:** May 24, 2026  
**Author:** Jonathan / Maxx Stacks  
**Status:** Pre-Implementation Spec  
**Priority:** A2 (after AI F&I Presenter)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature 1 — DS360 Assist (AI Agent)](#2-feature-1--ds360-assist-ai-agent)
3. [Feature 2 — Remote Support (Screen Share)](#3-feature-2--remote-support-screen-share)
4. [Database Schema](#4-database-schema)
5. [API Routes](#5-api-routes)
6. [UI/UX Specifications](#6-uiux-specifications)
7. [Implementation Phases](#7-implementation-phases)
8. [Tech Stack & Dependencies](#8-tech-stack--dependencies)
9. [Security & Privacy](#9-security--privacy)
10. [CC Execution Notes](#10-cc-execution-notes)

---

## 1. Executive Summary

Two interconnected features that transform how dealers interact with DS360 support:

**DS360 Assist** — An AI-powered agent embedded in the dealer portal (dealer_owner + dealer_staff roles) that knows DS360 inside and out. It guides dealers through creating units, filing claims, adding clients, purchasing products/services, and answers any platform question. When the AI can't resolve something, it escalates gracefully to human support channels.

**Remote Support** — A screen sharing solution where dealers generate a one-time access code. An operator can view the dealer's screen in real-time, or the dealer can grant screen takeover so the operator can demonstrate workflows directly. Think TeamViewer-lite, built into the platform.

---

## 2. Feature 1 — DS360 Assist (AI Agent)

### 2.1 Core Identity

- **Name:** DS360 Assist (displayed as "Assist" in the UI)
- **Personality:** Professional, knowledgeable, proactive. Speaks like a senior DS360 support rep who knows every feature and workflow. Canadian-friendly tone. Never says "I don't know" — instead says "Let me connect you with your account manager for that."
- **Avatar:** DS360 branded icon (navy circle with white chat/sparkle icon)
- **Position:** Floating action button (bottom-right corner of dealer portal), expands into a chat panel

### 2.2 Target Roles

| Role | Access Level | Notes |
|------|-------------|-------|
| dealer_owner | Full agent access | Can access billing/subscription topics |
| dealer_staff | Limited agent access | Cannot discuss billing, pricing, or admin topics |

The agent is NOT available to operator roles (they have direct platform access) or customer/client roles (future phase).

### 2.3 Knowledge Architecture

The agent operates on three knowledge layers:

#### Layer 1 — Static Knowledge Base (Day 1)
Pre-loaded DS360 documentation that ships with the agent:

- **Platform Workflows:** Step-by-step guides for every dealer-facing workflow
  - Creating a new unit (VIN entry, spec population, photo upload)
  - Creating a new client (contact info, VIN association)
  - Filing a claim (inspect → FRC lines → photos → submit)
  - Purchasing add-on modules/services
  - Managing staff (invite, roles, permissions)
  - Reading claim statuses and what they mean
  - Understanding billing and invoices (dealer_owner only)
- **Terminology Glossary:** FRC, 3C, DAF, PDI, VIN, preauth#, claim#, F&I, GAP, etc.
- **Manufacturer-Specific Info:** FRC code formats for Jayco, Forest River, Heartland, Columbia NW, Keystone, Midwest Auto
- **Claim Types:** DAF vs PDI vs Warranty vs Extended Warranty — when to use each
- **FAQ:** Common dealer questions and answers
- **Error Resolution:** Common error states and how to fix them
- **Feature Explanations:** What each module does, how to enable/disable

**Storage format:** Markdown files in a `/knowledge-base/` directory, chunked and embedded into a vector store for RAG retrieval.

#### Layer 2 — Contextual Knowledge (Session-Aware)
The agent knows WHO it's talking to and WHAT they're looking at:

- **Dealer context:** Dealer name, active modules, subscription tier, staff count
- **User context:** Role (owner vs staff), name, permissions
- **Page context:** What page/section the dealer is currently viewing
- **Unit context:** If viewing a specific unit — VIN, make, model, year, claim history
- **Claim context:** If viewing a specific claim — status, FRC lines, approval state

This is injected into the system prompt dynamically per conversation.

#### Layer 3 — Learning Knowledge (Over Time)
The agent gets smarter through:

- **Conversation logs:** Every interaction stored, analyzed for gaps
- **Unanswered questions:** Flagged for operator review → new KB articles created
- **Usage patterns:** Which workflows dealers ask about most → proactive suggestions
- **Feedback loop:** Thumbs up/down on every response → quality scoring
- **Operator-authored updates:** Operators can add/edit KB articles from the admin panel

### 2.4 Core Capabilities

#### A. Guided Workflows (Action Mode)
The agent doesn't just answer questions — it walks dealers through multi-step processes:

```
Dealer: "I need to add a new unit"
Assist: "I'll help you add a new unit. Let's start:

Step 1 of 4 — Enter the VIN
Type or scan the VIN number for this unit.

[Text input field rendered in chat]"
```

Supported guided workflows:
1. **Create New Unit** — VIN → Specs → Photos → Save
2. **Create New Client** — Contact info → VIN association → Save
3. **File a Claim** — Select unit → Claim type → FRC lines → 3C descriptions → Photos → Review → Submit
4. **Add Staff Member** — Email → Role → Permissions → Send invite
5. **Purchase Module** — Browse available → Select → Confirm (redirects to billing for dealer_owner)

Each workflow:
- Has numbered steps with progress indication
- Can be abandoned and resumed
- Validates inputs before proceeding
- Shows inline previews where appropriate
- Completes the action via API calls on the dealer's behalf (with confirmation)

#### B. Question Answering (Knowledge Mode)
Standard RAG-powered Q&A against the knowledge base:

- "What does PDI mean?"
- "How do I check if a claim was approved?"
- "What FRC codes does Forest River use?"
- "Why can't I see the billing page?" (role-based answer)

#### C. Proactive Suggestions (Assist Mode)
Context-aware nudges based on what the dealer is doing:

- Viewing a unit with no claims: "This unit has been in inventory for 30 days with no claims filed. Need help starting a PDI?"
- On the claims page with zero claims: "Ready to file your first claim? I can walk you through it step by step."
- After creating a unit without photos: "Don't forget — photos are required before you can submit a claim for this unit."

Proactive suggestions appear as subtle banners or chat bubbles, NOT as interrupting modals.

#### D. Escalation Paths (Handoff Mode)
When the agent can't resolve something or the dealer explicitly asks for human help:

**Option 1 — Contact DS360 Support**
- Displays: DS360 support email + phone number
- Pre-fills a support email template with context (dealer name, page, issue summary)

**Option 2 — Open a Support Ticket**
- In-chat ticket creation form
- Fields: Subject, Description (pre-filled from conversation), Priority, Category
- Ticket saved to `support_tickets` table
- Operator notified via notification bell
- Dealer gets ticket# and can track status

**Option 3 — Email Your Account Manager**
- Displays the dealer's assigned account manager: name, email, phone
- One-click email compose with conversation context attached
- If no account manager assigned: "Your dealership doesn't have an assigned account manager yet. Let me connect you with general support."

**Option 4 — Live Chat with Support**
- Transitions the AI chat into a live chat with an available operator
- Operator sees full conversation history (AI portion + dealer messages)
- If no operator available: "Our support team is currently offline. I've created a ticket and they'll follow up within [SLA]. In the meantime, can I help with anything else?"
- Operator typing indicator shown to dealer
- Chat persists until operator or dealer closes it

**Option 5 — Request Screen Share**
- "Would you like an operator to see your screen? I can generate an access code for a screen share session."
- Links directly to Feature 2 (Remote Support)

### 2.5 Conversation Management

- **Thread persistence:** Conversations persist per-dealer, per-session (new session after 30 min idle)
- **History:** Dealer can view past conversations (last 90 days) via a "Past Conversations" tab in the chat panel
- **Context window:** Last 20 messages + system context injected per API call
- **Rate limiting:** 60 messages/hour per dealer (prevents abuse/loops)
- **Typing indicator:** Animated dots while agent is "thinking"
- **Markdown rendering:** Agent responses support bold, lists, links, code blocks
- **Quick replies:** Suggested follow-up buttons after each response (max 3)

### 2.6 Analytics Dashboard (Operator-Side)

Operators see an "Assist Analytics" section in the operator portal:

- **Volume:** Total conversations, messages, unique dealers
- **Resolution rate:** % of conversations resolved without escalation
- **Top questions:** Most frequently asked topics
- **Unanswered:** Questions the agent couldn't answer (flagged for KB updates)
- **Satisfaction:** Thumbs up/down ratio per topic
- **Escalation breakdown:** How many went to ticket vs email vs live chat
- **Active sessions:** Currently active AI + live chat sessions

---

## 3. Feature 2 — Remote Support (Screen Share)

### 3.1 Concept

A lightweight, browser-based screen sharing solution that requires NO software installation from the dealer. The dealer generates a one-time code, shares it with the operator, and the operator can view (or control) the dealer's screen.

### 3.2 User Flows

#### Flow A — View Only (Dealer Initiates)

```
1. Dealer clicks "Request Support" → "Share My Screen" in the Assist panel
   OR navigates to Settings → Support → Screen Share
2. System generates a 6-digit alphanumeric code (expires in 10 minutes)
3. Dealer sees: "Your access code is: A7K-3M2. Share this with your DS360 support rep."
4. Dealer shares code via phone/chat/ticket
5. Operator enters code in Operator Portal → Support → Remote Sessions
6. Connection established via WebRTC
7. Operator sees dealer's browser tab (DS360 portal only, not full desktop)
8. Yellow banner appears on dealer's screen: "DS360 Support is viewing your screen"
9. Either party can end the session at any time
```

#### Flow B — Screen Takeover (Operator Requests)

```
1. During an active View-Only session, operator clicks "Request Control"
2. Dealer sees a modal: "DS360 Support is requesting to control your screen. 
   This allows them to click and type in your portal to show you how to do something.
   [Allow] [Deny]"
3. If allowed: Operator's mouse/keyboard inputs are forwarded to dealer's browser
4. Green border + banner: "DS360 Support is controlling your screen"
5. Dealer can revoke control at any time by pressing ESC or clicking "Take Back Control"
6. Session auto-ends after 30 minutes of inactivity
```

#### Flow C — Operator Initiates (From Live Chat)

```
1. During a live chat session, operator clicks "Start Screen Share"
2. Dealer receives in-chat prompt: "Your support rep wants to see your screen.
   [Share Screen] [Decline]"
3. If accepted: Browser prompts for screen share permission (WebRTC getDisplayMedia)
4. Proceeds as Flow A
```

### 3.3 Technical Architecture

**Recommended approach: LiveKit (self-hosted or Cloud)**

LiveKit provides the WebRTC infrastructure with built-in screen sharing support, room-based sessions, and participant management. It handles STUN/TURN, codec negotiation, and bandwidth estimation.

```
┌─────────────────────────────────────────────────────┐
│                    Architecture                      │
│                                                      │
│  Dealer Browser                  Operator Browser    │
│  ┌──────────────┐               ┌──────────────┐    │
│  │ LiveKit SDK  │               │ LiveKit SDK  │    │
│  │ (Publisher)  │               │ (Subscriber) │    │
│  │              │               │              │    │
│  │ Screen Share ├──────────────►│ View Screen  │    │
│  │ Track        │    WebRTC     │              │    │
│  │              │◄──────────────┤ Input Events │    │
│  │ Input Recv.  │  Data Channel │ (takeover)   │    │
│  └──────┬───────┘               └──────┬───────┘    │
│         │                              │            │
│         └──────────┬───────────────────┘            │
│                    │                                 │
│              ┌─────▼─────┐                          │
│              │  LiveKit   │                          │
│              │  Server    │                          │
│              │  (SFU)     │                          │
│              └─────┬──────┘                          │
│                    │                                 │
│              ┌─────▼──────┐                         │
│              │  DS360 API  │                         │
│              │  (Session   │                         │
│              │   Mgmt)     │                         │
│              └─────────────┘                         │
└─────────────────────────────────────────────────────┘
```

**Key technical decisions:**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Screen capture scope | Browser tab only | `getDisplayMedia({ preferCurrentTab: true })` — safer, no desktop exposure |
| Connection protocol | WebRTC via LiveKit | Low latency, NAT traversal, built-in screen share |
| Remote control method | WebRTC Data Channel | Operator sends mouse/keyboard events; dealer-side JS replays them |
| Access code | 6-char alphanumeric | Short enough to read aloud, expires in 10 min |
| Session recording | Optional (Phase 2) | Record sessions for training/QA (requires consent) |
| Hosting | LiveKit Cloud initially | Self-host later if volume justifies it |

**Remote control implementation:**

For screen takeover, the operator's mouse movements and keyboard inputs are serialized and sent via WebRTC Data Channel to the dealer's browser. The dealer-side client receives these events and programmatically dispatches them as DOM events within the DS360 portal iframe/window.

```
Operator action → serialize {type, x, y, key, ...}
  → Data Channel → Dealer browser
  → Deserialize → dispatchEvent() on portal DOM
```

Limitations:
- Only works within the DS360 portal (not arbitrary websites)
- Browser security sandbox prevents true OS-level control
- Sufficient for DS360 workflow demonstrations
- For full desktop control, dealers would need to use a third-party tool (TeamViewer, etc.)

### 3.4 Session Management

| Property | Value |
|----------|-------|
| Code format | `XXX-XXX` (6 alphanumeric, hyphenated for readability) |
| Code expiry | 10 minutes from generation |
| Max concurrent sessions per dealer | 1 |
| Session timeout (idle) | 30 minutes |
| Session timeout (absolute) | 2 hours |
| Session recording | Off by default, opt-in per session |
| Reconnection | Auto-reconnect within 30 seconds on network drop |

### 3.5 Security

- Codes are single-use and expire
- Session requires active Clerk authentication on BOTH sides
- Dealer must be authenticated as dealer_owner or dealer_staff
- Operator must be authenticated as operator_admin or operator_staff
- All WebRTC traffic is encrypted (DTLS-SRTP, standard)
- Screen takeover requires explicit dealer consent per session
- Dealer can revoke control instantly (ESC key or UI button)
- Session events logged to audit trail (who connected, duration, takeover granted/revoked)
- No data from the screen share is stored server-side unless recording is explicitly enabled

---

## 4. Database Schema

### 4.1 AI Agent Tables

```sql
-- Knowledge base articles (operator-managed)
CREATE TABLE kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'workflow', 'faq', 'terminology', 'troubleshooting', 'manufacturer'
  subcategory VARCHAR(100),
  tags TEXT[], -- ['claims', 'units', 'jayco', 'frc']
  roles_visible TEXT[] DEFAULT '{dealer_owner,dealer_staff}', -- which roles can see this
  status VARCHAR(20) DEFAULT 'published', -- 'draft', 'published', 'archived'
  author_id VARCHAR(255) NOT NULL, -- Clerk user ID of operator who wrote it
  embedding VECTOR(1536), -- for RAG similarity search (pgvector)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation threads
CREATE TABLE assist_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  user_role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'escalated', 'resolved', 'expired'
  escalation_type VARCHAR(50), -- 'ticket', 'email', 'live_chat', 'screen_share', NULL
  escalated_to VARCHAR(255), -- operator user ID if live chat
  satisfaction_rating INTEGER, -- 1-5 or NULL
  thumbs_up_count INTEGER DEFAULT 0,
  thumbs_down_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages within a conversation
CREATE TABLE assist_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES assist_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'operator', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- { kb_sources: [...], workflow_step: 3, quick_replies: [...] }
  feedback VARCHAR(10), -- 'up', 'down', NULL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets created via Assist
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- 'DS-000001' format
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  user_id VARCHAR(255) NOT NULL,
  conversation_id UUID REFERENCES assist_conversations(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100), -- 'billing', 'technical', 'feature_request', 'bug', 'general'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'waiting_on_dealer', 'resolved', 'closed'
  assigned_to VARCHAR(255), -- operator user ID
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unanswered/flagged questions for KB improvement
CREATE TABLE assist_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES assist_conversations(id),
  message_id UUID REFERENCES assist_messages(id),
  question TEXT NOT NULL,
  frequency INTEGER DEFAULT 1, -- how many times this question has been asked
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'reviewed', 'kb_created', 'dismissed'
  kb_article_id UUID REFERENCES kb_articles(id), -- linked article once created
  reviewed_by VARCHAR(255), -- operator who reviewed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Remote Support Tables

```sql
-- Screen share sessions
CREATE TABLE remote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code VARCHAR(7) UNIQUE NOT NULL, -- 'A7K-3M2' format
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  dealer_user_id VARCHAR(255) NOT NULL, -- Clerk user ID of dealer
  operator_user_id VARCHAR(255), -- Clerk user ID of operator (NULL until connected)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'connected', 'takeover', 'ended', 'expired'
  takeover_granted BOOLEAN DEFAULT FALSE,
  takeover_granted_at TIMESTAMPTZ,
  takeover_revoked_at TIMESTAMPTZ,
  livekit_room_name VARCHAR(255), -- LiveKit room identifier
  recording_enabled BOOLEAN DEFAULT FALSE,
  recording_url VARCHAR(500), -- S3/storage URL if recorded
  code_expires_at TIMESTAMPTZ NOT NULL,
  connected_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ended_by VARCHAR(20), -- 'dealer', 'operator', 'timeout', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session audit log
CREATE TABLE remote_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES remote_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'code_generated', 'connected', 'takeover_requested', 'takeover_granted', 'takeover_revoked', 'disconnected', 'reconnected', 'ended'
  actor VARCHAR(20) NOT NULL, -- 'dealer', 'operator', 'system'
  metadata JSONB, -- additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3 Account Manager Assignment (Supporting Table)

```sql
-- Links dealers to their assigned account manager (operator)
CREATE TABLE dealer_account_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID UNIQUE NOT NULL REFERENCES dealers(id),
  operator_user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  operator_name VARCHAR(255) NOT NULL,
  operator_email VARCHAR(255) NOT NULL,
  operator_phone VARCHAR(50),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Routes

### 5.1 AI Agent Routes

```
POST   /api/assist/message              — Send message, get AI response
GET    /api/assist/conversations         — List dealer's past conversations
GET    /api/assist/conversations/:id     — Get conversation with messages
POST   /api/assist/conversations/:id/feedback  — Thumbs up/down on a message
POST   /api/assist/escalate/ticket       — Create support ticket from conversation
POST   /api/assist/escalate/live-chat    — Transition to live chat
GET    /api/assist/account-manager       — Get dealer's assigned account manager

# Operator-only routes
GET    /api/assist/analytics             — Assist analytics dashboard data
GET    /api/assist/knowledge-gaps        — View unanswered questions
POST   /api/assist/kb/articles           — Create KB article
PUT    /api/assist/kb/articles/:id       — Update KB article
DELETE /api/assist/kb/articles/:id       — Archive KB article
GET    /api/assist/live-sessions         — View active live chat sessions
POST   /api/assist/live-sessions/:id/join   — Operator joins live chat
POST   /api/assist/live-sessions/:id/close  — Operator closes live chat
```

### 5.2 Remote Support Routes

```
POST   /api/remote/sessions              — Generate access code (dealer)
GET    /api/remote/sessions/:code        — Validate code + get session info
POST   /api/remote/sessions/:code/connect    — Operator connects to session
POST   /api/remote/sessions/:id/takeover     — Operator requests takeover
POST   /api/remote/sessions/:id/grant        — Dealer grants takeover
POST   /api/remote/sessions/:id/revoke       — Dealer revokes takeover
POST   /api/remote/sessions/:id/end          — End session (either party)
GET    /api/remote/sessions/:id/token        — Get LiveKit access token

# Operator-only routes
GET    /api/remote/active-sessions       — List all active remote sessions
GET    /api/remote/session-history        — Past session logs with audit trail
```

### 5.3 WebSocket Events (Live Chat + Remote Support)

```
# Live Chat
assist:message           — New message in live chat (bidirectional)
assist:typing            — Typing indicator
assist:operator-joined   — Operator joined the chat
assist:operator-left     — Operator left the chat
assist:session-closed    — Chat session ended

# Remote Support
remote:takeover-request  — Operator requesting control
remote:takeover-granted  — Dealer granted control
remote:takeover-revoked  — Dealer revoked control
remote:session-ended     — Session ended
remote:reconnecting      — Participant reconnecting
```

---

## 6. UI/UX Specifications

### 6.1 Dealer Portal — Assist Chat Panel

**Trigger:** Floating action button, bottom-right corner, 56px circle

```
┌──────────────────────────────────────────────────┐
│ DS360 Portal (any page)                          │
│                                                  │
│                                                  │
│                                                  │
│                                                  │
│                                                  │
│                                                  │
│                                            ┌───┐ │
│                                            │ ✦ │ │  ← FAB (navy bg, white icon)
│                                            └───┘ │
└──────────────────────────────────────────────────┘
```

**Expanded Chat Panel:** Slides up from FAB, 400px wide × 600px tall (desktop), full-screen on mobile

```
┌──────────────────────────────────┐
│ ┌──────────────────────────────┐ │
│ │ ✦ DS360 Assist          ✕ ─ │ │  ← Header (navy bg)
│ ├──────────────────────────────┤ │
│ │ [Past Chats] [New Chat]     │ │  ← Tab bar
│ ├──────────────────────────────┤ │
│ │                              │ │
│ │  ┌─ Assist ────────────────┐ │ │
│ │  │ Hi! I'm DS360 Assist.   │ │ │
│ │  │ How can I help you      │ │ │
│ │  │ today?                  │ │ │
│ │  └─────────────────────────┘ │ │
│ │                              │ │
│ │  [Create a Unit]             │ │  ← Quick reply buttons
│ │  [File a Claim]              │ │
│ │  [Talk to Support]           │ │
│ │                              │ │
│ │          ┌─ You ───────────┐ │ │
│ │          │ How do I add    │ │ │
│ │          │ photos to a     │ │ │
│ │          │ claim?          │ │ │
│ │          └─────────────────┘ │ │
│ │                              │ │
│ │  ┌─ Assist ────────────────┐ │ │
│ │  │ Great question! Here's  │ │ │
│ │  │ how to add photos...    │ │ │
│ │  │                         │ │ │
│ │  │ 👍 👎                   │ │ │  ← Feedback buttons
│ │  └─────────────────────────┘ │ │
│ │                              │ │
│ ├──────────────────────────────┤ │
│ │ [Type a message...]    [➤]  │ │  ← Input bar
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Escalation UI (when dealer asks for human help):**

```
┌──────────────────────────────────┐
│  ┌─ Assist ────────────────────┐ │
│  │ I'd be happy to connect you │ │
│  │ with our team. How would    │ │
│  │ you like to reach us?       │ │
│  │                             │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 📋 Open a Ticket        │ │ │
│  │ │ We'll respond within    │ │ │
│  │ │ 24 hours                │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 💬 Live Chat            │ │ │
│  │ │ Chat with a support rep │ │ │
│  │ │ right now               │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ ✉️ Email Account Mgr    │ │ │
│  │ │ Sarah K. — sarah@ds360  │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 🖥️ Share My Screen      │ │ │
│  │ │ Let support see what    │ │ │
│  │ │ you see                 │ │ │
│  │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────────┐ │ │
│  │ │ 📞 Contact Support      │ │ │
│  │ │ 1-800-DS360 / email     │ │ │
│  │ └─────────────────────────┘ │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

### 6.2 Dealer Portal — Screen Share UI

**Access Code Display (Dealer-side):**

```
┌──────────────────────────────────┐
│       Share Your Screen          │
│                                  │
│  Your one-time access code:      │
│                                  │
│    ┌───────────────────────┐     │
│    │     A 7 K - 3 M 2     │     │  ← Large, mono-spaced, easy to read
│    └───────────────────────┘     │
│                                  │
│  ⏱ Expires in 9:42              │  ← Countdown timer
│                                  │
│  Share this code with your       │
│  DS360 support representative.   │
│                                  │
│  [Copy Code]  [Cancel]           │
│                                  │
│  ⚠ This code gives view-only    │
│  access to your DS360 portal.    │
│  You'll be asked before any      │
│  control is granted.             │
└──────────────────────────────────┘
```

**Active Session Banner (Dealer-side):**

```
┌──────────────────────────────────────────────────────────┐
│ 🟡 DS360 Support is viewing your screen       [End]     │  ← Yellow banner, top of portal
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 🟢 DS360 Support is controlling your screen   [ESC End] │  ← Green banner during takeover
└──────────────────────────────────────────────────────────┘
```

### 6.3 Operator Portal — Remote Support Dashboard

```
┌──────────────────────────────────────────────────┐
│ Remote Support                                    │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ Enter Access Code                           │  │
│ │                                             │  │
│ │ [___]-[___]              [Connect]          │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│ Active Sessions                                   │
│ ┌──────────┬──────────┬─────────┬────────────┐   │
│ │ Dealer   │ User     │ Status  │ Actions    │   │
│ ├──────────┼──────────┼─────────┼────────────┤   │
│ │ RV World │ John D.  │ Viewing │ [Takeover] │   │
│ │ Trail RV │ Sarah M. │ Pending │ [Join]     │   │
│ └──────────┴──────────┴─────────┴────────────┘   │
│                                                   │
│ Session History (last 30 days)                    │
│ ┌──────────┬──────────┬─────────┬────────────┐   │
│ │ Date     │ Dealer   │ Duration│ Type       │   │
│ ├──────────┼──────────┼─────────┼────────────┤   │
│ │ May 23   │ RV World │ 12 min  │ View+Ctrl  │   │
│ │ May 22   │ Trail RV │ 5 min   │ View Only  │   │
│ └──────────┴──────────┴─────────┴────────────┘   │
└──────────────────────────────────────────────────┘
```

---

## 7. Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Install pgvector extension on Neon PostgreSQL
- [ ] Create all database tables (schema above)
- [ ] Set up Anthropic API integration for the agent (Claude Sonnet as the brain)
- [ ] Build knowledge base CRUD (operator-side): create, edit, archive articles
- [ ] Build vector embedding pipeline: article → chunk → embed → store
- [ ] Build `/api/assist/message` endpoint with basic RAG retrieval
- [ ] Build chat panel UI component (floating button, expand/collapse, message list, input)

### Phase 2 — Agent Intelligence (Weeks 3–4)
- [ ] Build dynamic system prompt with dealer/user/page context injection
- [ ] Implement role-based response filtering (dealer_owner vs dealer_staff)
- [ ] Build guided workflow engine (step-by-step flows with progress tracking)
- [ ] Implement quick reply buttons and inline action buttons
- [ ] Add conversation persistence and "Past Chats" tab
- [ ] Build feedback system (thumbs up/down per message)
- [ ] Knowledge gap tracking (unanswered question logging)

### Phase 3 — Escalation Paths (Week 5)
- [ ] Support ticket creation from conversation
- [ ] Account manager lookup and display
- [ ] Live chat handoff (AI → operator transition)
- [ ] WebSocket integration for live chat real-time messaging
- [ ] Operator live chat dashboard (join, respond, close)
- [ ] Notification bell integration for new tickets and live chat requests

### Phase 4 — Remote Support (Weeks 6–7)
- [ ] LiveKit Cloud account setup and API key configuration
- [ ] Access code generation and validation endpoints
- [ ] Dealer-side screen share initiation (getDisplayMedia)
- [ ] Operator-side screen viewer component
- [ ] Session management (connect, timeout, end)
- [ ] Screen takeover request/grant/revoke flow
- [ ] Data Channel setup for remote input events
- [ ] Session audit logging
- [ ] Security banner UI (yellow for viewing, green for control)

### Phase 5 — Polish & Analytics (Week 8)
- [ ] Assist analytics dashboard (operator portal)
- [ ] Proactive suggestion engine (context-aware nudges)
- [ ] Knowledge base seeding (write initial 50+ articles covering core workflows)
- [ ] Rate limiting and abuse prevention
- [ ] Mobile responsive optimization for chat panel
- [ ] Session recording opt-in (remote support)
- [ ] End-to-end testing across all flows

---

## 8. Tech Stack & Dependencies

### AI Agent

| Component | Technology | Notes |
|-----------|-----------|-------|
| LLM | Anthropic Claude Sonnet 4 | Via API, system prompt + RAG context |
| Vector DB | pgvector (Neon) | Embedded in existing Neon PostgreSQL |
| Embeddings | Anthropic Voyager or OpenAI ada-002 | For KB article embeddings |
| RAG Framework | Custom (no LangChain) | Direct Anthropic API + pgvector similarity search |
| Real-time (live chat) | Socket.io (existing) or Liveblocks | WebSocket for operator ↔ dealer live messaging |
| Chat UI | Custom React component | Tailwind-styled, matches DS360 design system |

### Remote Support

| Component | Technology | Notes |
|-----------|-----------|-------|
| WebRTC Platform | LiveKit Cloud | Managed SFU, screen share built-in |
| Client SDK | @livekit/components-react | React components for video/screen |
| Server SDK | livekit-server-sdk (Node) | Generate access tokens, manage rooms |
| Remote Control | WebRTC Data Channel | Serialize mouse/keyboard events |
| Session Recording | LiveKit Egress (optional) | Cloud recording to S3 |

### New Dependencies to Install

```bash
# AI Agent
npm install @anthropic-ai/sdk pgvector

# Remote Support
npm install livekit-client livekit-server-sdk @livekit/components-react
```

### New Environment Variables

```env
# AI Agent
ANTHROPIC_API_KEY=sk-ant-...          # Already planned
EMBEDDING_MODEL=voyage-3              # Or text-embedding-ada-002

# Remote Support  
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://ds360.livekit.cloud  # Or self-hosted URL

# Support
DS360_SUPPORT_EMAIL=support@dealersuite360.com
DS360_SUPPORT_PHONE=1-800-XXX-XXXX
```

---

## 9. Security & Privacy

### AI Agent
- All conversations encrypted at rest (Neon PostgreSQL encryption)
- Dealer context injected server-side only (never exposed to client)
- Rate limiting prevents prompt injection attacks via excessive messaging
- Agent system prompt includes explicit guardrails: no financial advice, no competitor recommendations, no data from other dealers
- PII in conversations (names, VINs, emails) handled under existing DS360 privacy policy
- Conversation data retained 90 days, then auto-archived

### Remote Support
- Access codes are cryptographically random, single-use, expire in 10 minutes
- Both parties must be authenticated via Clerk
- RBAC enforced: only operator_admin/operator_staff can connect
- WebRTC traffic encrypted via DTLS-SRTP (standard)
- Screen share limited to browser tab (not full desktop) when possible
- Takeover requires explicit per-session consent
- Dealer can revoke control instantly
- Full audit trail of all session events
- No screen data stored unless recording explicitly enabled by both parties

---

## 10. CC Execution Notes

### File Structure (New Files)

```
src/
├── components/
│   ├── assist/
│   │   ├── AssistPanel.tsx          — Main chat panel container
│   │   ├── AssistFAB.tsx            — Floating action button
│   │   ├── AssistMessageList.tsx    — Message display with markdown
│   │   ├── AssistInput.tsx          — Message input with send button
│   │   ├── AssistQuickReplies.tsx   — Suggested reply buttons
│   │   ├── AssistEscalation.tsx     — Escalation option cards
│   │   ├── AssistWorkflow.tsx       — Guided workflow step renderer
│   │   ├── AssistPastChats.tsx      — Conversation history list
│   │   └── AssistLiveChat.tsx       — Live chat mode (operator messages)
│   ├── remote-support/
│   │   ├── ScreenShareGenerator.tsx — Access code generation (dealer)
│   │   ├── ScreenShareViewer.tsx    — Screen viewer (operator)
│   │   ├── ScreenShareBanner.tsx    — Yellow/green status banner
│   │   ├── TakeoverModal.tsx        — Consent modal for takeover
│   │   └── RemoteDashboard.tsx      — Operator session management
│   └── support/
│       ├── TicketForm.tsx           — In-chat ticket creation
│       └── AccountManagerCard.tsx   — Account manager contact display
├── api/
│   ├── assist/
│   │   ├── message.ts              — POST /api/assist/message
│   │   ├── conversations.ts        — GET conversations
│   │   ├── feedback.ts             — POST feedback
│   │   ├── escalate.ts             — POST ticket/live-chat
│   │   ├── kb.ts                   — KB CRUD (operator)
│   │   └── analytics.ts            — Analytics data
│   └── remote/
│       ├── sessions.ts             — Session CRUD
│       ├── connect.ts              — Code validation + connect
│       ├── takeover.ts             — Request/grant/revoke
│       └── token.ts                — LiveKit token generation
├── lib/
│   ├── assist-engine.ts            — RAG pipeline: embed query → search → build prompt → call Claude
│   ├── assist-context.ts           — Dynamic context builder (dealer, user, page, unit, claim)
│   ├── assist-workflows.ts         — Workflow definitions and step logic
│   ├── vector-store.ts             — pgvector operations (embed, search, upsert)
│   ├── livekit-server.ts           — LiveKit room/token management
│   └── access-code.ts              — Code generation and validation
├── knowledge-base/                  — Markdown source files for KB
│   ├── workflows/
│   │   ├── create-unit.md
│   │   ├── create-client.md
│   │   ├── file-claim.md
│   │   ├── manage-staff.md
│   │   └── purchase-module.md
│   ├── faq/
│   │   ├── general.md
│   │   ├── claims.md
│   │   ├── billing.md
│   │   └── manufacturers.md
│   ├── terminology/
│   │   └── glossary.md
│   └── troubleshooting/
│       ├── common-errors.md
│       └── permission-issues.md
└── db/
    └── schema/
        ├── assist.ts                — Drizzle schema for assist tables
        └── remote-support.ts        — Drizzle schema for remote tables
```

### CC Constraints

1. **DO NOT** restructure existing file architecture — add new files only
2. **DO NOT** modify existing page components unless adding the AssistFAB overlay
3. The Assist panel must be a global overlay component mounted at the app shell level (PortalShell), NOT per-page
4. All new API routes must follow existing Express middleware patterns (Clerk auth, role check, error handling)
5. Knowledge base markdown files are SOURCE files — they get processed into vector embeddings at build/seed time, NOT read at runtime
6. LiveKit tokens must be generated server-side only (never expose API secret to client)
7. Remote control events must be sanitized server-side before forwarding (prevent XSS via injected keyboard events)
8. The chat panel must not interfere with existing notification bell or navigation components
9. Minimum test: can a dealer ask "how do I file a claim?" and get a correct, sourced response
10. Minimum test: can a dealer generate a code, operator enter it, and see the dealer's screen

---

## Appendix A — System Prompt Template (AI Agent)

```
You are DS360 Assist, the official support agent for DealerSuite360 — a SaaS platform 
for North American RV dealerships. You help dealers navigate the platform efficiently.

## Your Identity
- Name: DS360 Assist (or just "Assist")
- Tone: Professional, helpful, knowledgeable. Like a senior support rep.
- You NEVER make up information. If you don't know, offer to escalate.
- You NEVER discuss other dealers' data or information.
- You NEVER provide financial, legal, or tax advice.

## Current Context
- Dealer: {{dealer_name}} (ID: {{dealer_id}})
- User: {{user_name}} (Role: {{user_role}})
- Current Page: {{current_page}}
- Active Modules: {{active_modules}}
- Subscription Tier: {{subscription_tier}}
{{#if unit_context}}
- Viewing Unit: {{unit_vin}} — {{unit_year}} {{unit_make}} {{unit_model}}
- Unit Claims: {{unit_claim_count}} ({{unit_open_claims}} open)
{{/if}}
{{#if claim_context}}
- Viewing Claim: {{claim_number}} — Status: {{claim_status}}
- Claim Type: {{claim_type}}
- FRC Lines: {{frc_line_count}}
{{/if}}

## Role Restrictions
{{#if is_dealer_staff}}
This user is a Dealer Staff member. Do NOT discuss:
- Billing, invoices, or pricing
- Subscription management
- Staff management or permissions
- Account manager contact information
If they ask about these topics, say: "That information is available to your dealership owner. 
Please check with them or I can help you with something else."
{{/if}}

## Knowledge Base Context
{{kb_context}}

## Available Actions
When a dealer asks to DO something (not just learn about it), offer to walk them through 
it step-by-step. Available guided workflows:
- Create a new unit
- Create a new client
- File a claim
- Add a staff member

## Escalation
If you cannot answer a question or the dealer explicitly asks for human help, present 
the escalation options: Open a Ticket, Live Chat, Email Account Manager, Share Screen, 
or Contact Support directly.
```

---

## Appendix B — Access Code Generation Logic

```typescript
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/1/O/0 confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}
// Output: "A7K-3M2"
```
