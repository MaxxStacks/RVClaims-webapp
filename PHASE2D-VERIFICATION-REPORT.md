# Phase 2D Data Flow Verification Report
**Run tag:** Phase2D-Verify-1777171670272
**Date:** 2026-04-26T02:47:50.953Z
**Tested dealership:** Smith's RV Centre

## Summary
- ✓ 10 passed
- ✗ 0 failed
- — 3 skipped

## Results

- **✓ Unit created** — id=d88fddd6-423b-4049-92ee-5a8cff4408bd, VIN=VERIFY77171670454
- **✓ Operator can see unit** — Unit visible in cross-dealer query
- **✓ Dealer can see own unit** — Unit visible in dealership-scoped query
- **✓ Claim created** — VRF-71670554, status=new_unassigned
- **✓ Operator can see claim** — Claim visible to operator
- **✓ Claim linked to unit** — 1 claim(s) found on unit
- **✓ notification_deliveries table** — Table exists and queryable
- **— Recent notifications** — No recent notifications — expected, since direct DB insert bypasses event bus.
- **✓ Notification deliveries lifetime count** — 0 total deliveries in DB
- **— Notification deliveries (24h)** — 0 notification(s) created in last 24h
- **— Email-channel notifications (24h)** — 0 email-channel notifications in last 24h
- **✓ Operator portal claim visibility** — Claim appears in operator's claim list query
- **✓ Dealer portal claim visibility** — Claim appears in dealer's claim list query

## Created test data (use --cleanup to remove)
- Unit: VERIFY77171670454 (id=d88fddd6-423b-4049-92ee-5a8cff4408bd)
- Claim: VRF-71670554 (id=7227de0c-4e6f-41ab-84fb-e432d6b3860e)

## Important note
This test inserts data **directly via SQL**, which bypasses the API layer's event bus. Notifications and emails are NOT triggered by this verification.
To verify the event bus end-to-end, manually create a claim via the dealer portal UI and watch for:
1. Notification appears in operator's bell within 30s
2. Email arrives at operator's inbox within 60s
3. Operator's claim queue updates in real time
