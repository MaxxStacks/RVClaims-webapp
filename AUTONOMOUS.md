# AUTONOMOUS.md — Remote Support Enhancements
# DROP THIS FILE IN PROJECT ROOT AND RUN:
# claude --dangerously-skip-permissions
# THEN PASTE THE TRIGGER PROMPT BELOW

## TRIGGER PROMPT:

```
Read AUTONOMOUS.md in the project root. Execute everything in it. Do NOT stop, do NOT ask for confirmation, do NOT wait for human input at any point. Complete ALL work in a single uninterrupted session.

CRITICAL EXECUTION RULES:
1. Do NOT stop between steps. Do NOT pause for verification. Do NOT ask "should I continue?" — the answer is always YES, CONTINUE.
2. If something fails, fix it yourself and keep going. Do NOT stop to report the error.
3. If you're unsure about a path, file name, or pattern — read the existing code to figure it out. Do NOT ask.
4. If a dependency is missing, install it. Do NOT ask permission.
5. If a table needs a new column, ALTER TABLE. Do NOT stop to confirm.
6. If you need to create a new file, create it. If you need to edit an existing file, edit it. Just do it.
7. After completing ALL work, run the dev server and test that it boots without errors. Fix any errors.
8. Write a summary of everything you did to COMPLETED.md in the project root when finished.

YOU HAVE FULL PERMISSION TO:
- Install npm packages
- Create files anywhere in the project
- Edit any existing file
- Run database migrations
- Modify the Express server entry point to register new routes
- Add new React components and routes
- Modify existing components to add new UI elements
- Run shell commands
- Do whatever is needed to complete the work

NOW READ THE FULL SPEC BELOW AND EXECUTE IT ALL.

---

## CONTEXT: What already exists

DS360 Assist is fully built (Phases 1-5 complete):
- AI agent chat panel with FAB (bottom-right of dealer portal)
- RAG knowledge base with 15 seeded articles + pgvector
- Guided workflows (create unit, client, claim, staff)
- Escalation system: tickets, live chat (Socket.io), account manager, screen share
- Remote support: LiveKit screen share with access codes (XXX-XXX), takeover via DataChannel
- Analytics dashboard, proactive suggestions, rate limiting, mobile responsive
- Key files you'll need to touch:
  - App.tsx — main app with route definitions and global component mounting
  - AssistPanel.tsx — chat panel with escalation state machine
  - AssistEscalation.tsx — 5-card escalation menu
  - ScreenShareGenerator.tsx — access code generation UI (currently inside AssistPanel)
  - ScreenShareActive.tsx — active screen share with getDisplayMedia
  - ScreenShareBanner.tsx — yellow/green top banner during sessions
  - RemoteDashboard.tsx — operator portal at /operator/admin/remote-support
  - RemoteSupportContext.tsx — shared state provider
  - server/routes/remote/sessions.ts — session API routes
  - server/routes/remote/takeover.ts — takeover API routes
  - server/lib/livekit-server.ts — LiveKit token/room management
  - server/lib/access-code.ts — code generation
  - The WebSocket setup from Phase 3 (find it — likely server/websocket.ts or similar)
  - The notification system (find the notification table and creation pattern)

IMPORTANT: Before you start writing code, spend 5 minutes reading the existing codebase structure. Run `find src/components/remote-support -type f` and `find server/routes/remote -type f` and `find server/lib -type f` to understand what exists. Read the key files listed above to understand current patterns. Match those patterns.

---

## WORK TO COMPLETE (3 enhancements, do all of them without stopping)

### ENHANCEMENT 1: Direct Screen Share Access for Dealers

The screen share is currently buried behind the AI chat escalation flow. Add direct entry points.

#### 1A — Extract useScreenShare hook

Before adding new entry points, refactor the screen share initiation logic out of AssistPanel so it can be reused.

Create src/hooks/useScreenShare.ts (or src/components/remote-support/useScreenShare.ts — match existing hook patterns):
- Extract from ScreenShareGenerator.tsx: the POST /api/remote/sessions call, polling for operator connection, code expiration countdown, cancel logic
- Hook returns: { accessCode, expiresAt, timeRemaining, isConnected, isGenerating, generateCode, cancelSession, sessionId }
- ScreenShareGenerator.tsx should be updated to USE this hook instead of having its own internal state

#### 1B — AppBar Remote Support Icon

Find the dealer portal's AppBar component (the top bar where the notification bell lives). Add:
- A monitor/screen-share icon (use whatever icon library the project uses — Lucide, Heroicons, etc.) positioned to the LEFT of the notification bell
- Same size and color treatment as the notification bell icon
- Only render for dealer_owner and dealer_staff roles (check existing role-check patterns)
- onClick: toggles a popover/dropdown below the icon (320px wide, white bg, rounded corners, shadow matching notification dropdown style)
- Popover contents:
  - "Share My Screen" row — icon + text + chevron-right. onClick: renders ScreenShareGenerator inside the popover (or opens a small modal). Uses the useScreenShare hook.
  - "Transfer Documents" row — icon + text + chevron-right. onClick: opens the document transfer panel (Enhancement 3 — build the UI shell now, wire it up in Enhancement 3)
  - If active session exists: show "Active Session" with end button instead
- Only one popover open at a time — if notification bell dropdown is open, close it when this opens and vice versa. Find the existing pattern for this.

#### 1C — Settings/Support Page Section

Find the dealer's settings or support page in the route structure. Add a "Remote Support" section:
- Section header: "Remote Support"
- Subtext: "Share your screen with DS360 support for real-time assistance."
- "Start Screen Share" button — uses the useScreenShare hook, renders ScreenShareGenerator inline when clicked
- Below: collapsible "How it works" accordion with 4 steps explaining the flow
- If an active session exists: show session status with End button
- Below: "Recent Sessions" table showing last 10 sessions for this dealer (date, duration, operator name). Fetch from GET /api/remote/session-history filtered to this dealer. If this endpoint doesn't support dealer-side access, add dealer-scoped filtering.

#### 1D — Keep existing escalation path working

Verify that the "Share My Screen" card in AssistEscalation.tsx still works after the refactor. Update it to use the useScreenShare hook. Do NOT break the existing flow.

---

### ENHANCEMENT 2: Operator-Initiated Screen Share Requests

Operators can send a screen share request TO a dealer. The dealer gets notified and can accept/decline.

#### 2A — New session status and API routes

Add 'requested' and 'declined' to the remote_sessions status values. If status is stored as a string column, no schema change needed — just handle the new values in code. If there's a TypeScript enum/union type for session status, update it.

Add these routes to server/routes/remote/sessions.ts (or a new file if it's getting too long):

POST /api/remote/sessions/request
  - Auth: operator_admin or operator_staff
  - Body: { dealerId: string, message?: string }
  - Insert remote_sessions: status 'requested', operator_user_id set, dealer_id set, NO access_code yet, NO code_expires_at
  - Insert remote_session_events: event_type 'operator_requested', actor 'operator', metadata: { message }
  - Create notification for all users at that dealer (find the existing notification creation pattern and follow it exactly)
  - Emit WebSocket event to dealer users: remote:share-request { sessionId, operatorName, message }
  - Return: { sessionId, status: 'requested' }

POST /api/remote/sessions/:id/accept
  - Auth: dealer_owner or dealer_staff (validate dealer_id matches)
  - Generate access code (use existing generateAccessCode)
  - Update session: status → 'pending', access_code set, code_expires_at = NOW() + 10 min
  - Create LiveKit room
  - Generate BOTH tokens (dealer canPublish:true, operator canPublish:false)
  - Insert event: 'dealer_accepted'
  - Emit WebSocket to operator: remote:share-accepted { sessionId, accessCode, operatorToken, livekitUrl, roomName }
  - Return: { sessionId, accessCode, dealerToken, livekitUrl, roomName }

POST /api/remote/sessions/:id/decline
  - Auth: dealer_owner or dealer_staff
  - Update session: status → 'declined'
  - Insert event: 'dealer_declined'
  - Emit WebSocket to operator: remote:share-declined { sessionId }
  - Return: { sessionId, status: 'declined' }

#### 2B — Operator Request UI

In RemoteDashboard.tsx, add a "Request Screen Share" section ABOVE the existing "Enter Access Code" section:
- Searchable dealer dropdown (fetch dealer list — find existing endpoint or query)
- Optional message text input (max 200 chars, placeholder: "Describe what you need help with...")
- "Send Request" button
- After sending: show "Request sent — waiting for dealer to accept..." with a cancel option
- If dealer accepts: auto-connect to the session. Use the operatorToken from the WebSocket event. Transition to ScreenShareViewer automatically.
- If dealer declines: show "Request declined by dealer" with "Try Again" button
- Show pending requests in the Active Sessions table with status "Waiting for dealer..."

Also: find the operator's live chat interface (AssistLiveChat operator version) and add a "Request Screen Share" button to its toolbar. When clicked, auto-fill the dealer from the current chat session and call the same POST /api/remote/sessions/request endpoint.

#### 2C — Dealer Notification + Accept/Decline UI

Create src/components/remote-support/ScreenShareRequestToast.tsx:
- A slide-in toast notification from the top-right (positioned below AppBar)
- Content:
  - "🖥️ DS360 Support wants to view your screen"
  - Operator message in gray italic (if provided)
  - [Accept] button (green bg, white text)
  - [Decline] button (gray outline)
- Auto-dismiss after 60 seconds with no action (decline automatically)
- z-index above everything except ScreenShareBanner

Mount this toast component at the app shell level (same level as AssistFAB and ScreenShareBanner). Listen for the remote:share-request WebSocket event. When received, show the toast.

When Accept is clicked:
- Call POST /api/remote/sessions/:id/accept
- Use the returned dealerToken and livekitUrl to start screen share (call getDisplayMedia, connect to LiveKit)
- ScreenShareBanner activates (yellow)
- Toast dismisses

When Decline is clicked:
- Call POST /api/remote/sessions/:id/decline
- Toast dismisses

Also ensure the notification bell shows the request if the dealer missed the toast (find existing notification rendering and follow the pattern).

#### 2D — WebSocket event handlers

Add these WebSocket event handlers to the existing Socket.io setup:

Server-side (wherever WebSocket handlers are defined):
- remote:share-request — forward to dealer room
- remote:share-accepted — forward to operator
- remote:share-declined — forward to operator

Client-side dealer (mount in RemoteSupportContext or App.tsx):
- Listen for remote:share-request → show ScreenShareRequestToast

Client-side operator (mount in RemoteDashboard):
- Listen for remote:share-accepted → auto-connect to session
- Listen for remote:share-declined → show decline message

---

### ENHANCEMENT 3: Document Transfer

Operators and dealers can send files to each other. Works independently of screen share.

#### 3A — Database + Storage

Add the document_transfers table:
```sql
CREATE TABLE document_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id),
  sender_type VARCHAR(20) NOT NULL,
  sender_user_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  recipient_type VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add this table to the Drizzle schema file where the other remote support tables live. Run the migration.

Create server/lib/file-storage.ts:
- Configure multer: dest uploads/transfers/, 25MB limit
- Allowed MIME types: application/pdf, image/png, image/jpeg, image/gif, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, text/plain, application/zip
- Block everything else
- Serve uploaded files: add express.static middleware for /api/files/transfers/ pointing to uploads/transfers/
- Create the uploads/transfers/ directory if it doesn't exist

#### 3B — API Routes

Create server/routes/remote/transfers.ts:

POST /api/transfers/upload
  - Auth: any authenticated user
  - Multer middleware for single file upload
  - Validate file type and size (reject with 400 if invalid)
  - Insert into document_transfers with sender info from Clerk auth
  - Create notification for recipient(s)
  - Emit WebSocket: transfer:new-file { transferId, fileName, senderName, message }
  - Return: { transferId, fileName, fileUrl }

GET /api/transfers
  - Auth: any authenticated user
  - If dealer role: return transfers where dealer_id matches the user's dealer
  - If operator role: return transfers where sender_type='dealer' (received) OR sender_user_id matches (sent)
  - Query params: ?direction=sent|received&limit=20&offset=0
  - Return with pagination

GET /api/transfers/:id/download
  - Auth: participant in the transfer
  - Update status to 'downloaded', set downloaded_at
  - Return the file (res.download or redirect to file URL)

Register these routes in the Express app entry point.

#### 3C — Dealer Transfer UI

Create src/components/remote-support/DocumentTransfer.tsx:
- Two tabs: "Send" and "Received"

Send tab:
- Drag-and-drop area (dashed border, 100px height, "Drop files here or click to browse")
- File input (hidden, triggered by click on drop zone)
- After file selected: show file name, size, type icon, remove button
- Optional message input (text, max 200 chars)
- "Send to DS360 Support" button (green)
- Upload progress indicator during transfer
- Success message after upload
- File restrictions note: "Max 25MB. PDF, images, documents accepted."

Received tab:
- List of received files, most recent first
- Each row: file type icon, file name, size, sender name, date, message (if any)
- "Download" button per file
- Status badge: "New" (blue) or "Downloaded" (gray)
- Empty state: "No documents received yet."

Mount this component in two places:
1. The AppBar Remote Support popover (Enhancement 1B — "Transfer Documents" button opens this as a modal)
2. The Settings/Support page as a section below Remote Support

#### 3D — Operator Transfer UI

Add a "Document Transfers" section to RemoteDashboard.tsx (as a new tab or section):
- Same two-tab layout: "Send to Dealer" and "Received"
- Send tab: dealer selector dropdown + file upload + optional message + send button
- Received tab: list of files received from dealers with download buttons

Also: add a file attachment button (paperclip icon) to the operator's live chat toolbar:
- Clicking opens file picker
- File is uploaded via POST /api/transfers/upload with the conversation_id
- File card appears in the chat as a message: file icon + name + size + "Download" link
- The dealer sees this file card in their chat too

And: add the same attachment button to the dealer's Assist chat input bar (to the left of the send button):
- Same behavior — file uploaded, card appears in chat for both sides
- Only works during live chat mode (not during AI chat — the AI can't receive files)

#### 3E — Transfer Notifications

When a file is transferred:
- Create a notification for the recipient (follow existing notification creation patterns)
- Title format: "📎 [Sender Name] sent you a document: [filename]"
- If recipient is online: WebSocket toast event
- If during live chat: file card appears inline in chat

---

## FINAL TASKS (do these after all 3 enhancements)

1. Start the dev server. Fix ANY build errors or runtime errors. Do not leave broken code.
2. Check that the server boots cleanly with no unhandled errors in the console.
3. Verify all new routes are registered (grep for the route paths in the server entry point).
4. Create COMPLETED.md in the project root with:
   - List of all files created
   - List of all files modified
   - List of all new API routes added
   - List of all new database tables/columns added
   - List of all new npm packages installed
   - Any known issues or things that need manual setup (like env vars)
   - Total line count of changes

DO NOT STOP UNTIL COMPLETED.md IS WRITTEN. THAT IS YOUR FINISH LINE.
```
