# FuelPTPSG — safe release and backend handoff

Status: QA ONLY; NOT APPROVED FOR PRODUCTION. This document records source-level findings and handoff requirements, not proof of deployment or live backend security.

## Scope and non-negotiable constraints
- The existing Google Apps Script deployment and production spreadsheet are out of scope: no authorized edit access is available. Never run `setupDatabase()`, `replace`, or upload against production as a test.
- Never put a password, reusable password verifier, API token, or private spreadsheet data in GitHub Pages, repository source, logs, screenshots, or issue comments. Do not request credentials in chat.
- A public GitHub Pages frontend cannot enforce server-side authorization for downloadable exports or an unauthenticated `latest` API.
- Keep production `main` unchanged until separate explicit approval, a staging integration test, and verified rollback.

## What the QA branch currently does (source-level only)
- `backend/Code.gs` is a quarantined replacement in this PR, not a deployed backend: `doGet` permits only a non-data health response; database reads, writes, and `setupDatabase()` are disabled. Its former embedded password verifier and spreadsheet read/write implementation have been removed from the QA file. This does not change or secure an existing live Apps Script deployment.
- `bootstrap.js` sets `FUEL_REMOTE_SYNC_DISABLED=true`; remote sync and remote upload remain intentionally blocked. Excel import is a local preview only. Never present the QA branch as having working cloud refresh, secure upload, or verified backend access.
- Mock/browser CI and six-width screenshots validate isolated QA behavior. Run #74 passed at QA commit `54a1f70ed8c2077a9ae218b9670f1eaf1112d970`; the run does not validate production authorization or persistence.

## Historical legacy risks and unresolved release blockers
These findings concern the previous source and/or an existing deployment whose live configuration has **not** been inspected. Do not claim they remain in the quarantined QA `backend/Code.gs`.
1. The previous backend and remote-sync client embedded a reusable SHA-256 password verifier; the client also stored a plaintext password on `window`. The owner must assess exposure and rotate the old credential through an authorized channel before enabling any replacement backend.
2. The previous `action=latest` served records without authorization. Determine whether fuel data is public. If private, enforce identity and access on every server-side read and export path; a frontend password dialog does not protect public files or API responses.
3. The previous upload flow applied a new dataset locally before cloud persistence succeeded, potentially showing uncommitted data after failure. A new integration must preserve the active dataset on rejection or failed upload.
4. The previous multi-sheet replacement cleared and rewrote sheets sequentially, risking partial persistence on interruption. A new backend needs staging, validation, an atomic commit strategy where supported, and a recoverable backup/restore procedure.
5. A passing static security gate or mocked browser test cannot prove live endpoint authorization, data privacy, backup integrity, or safe cloud refresh.

## Authorized backend owner handoff (no secrets in chat)
1. Assign an authorized backend owner and create an isolated Apps Script project or suitable authenticated backend with a TEST-only spreadsheet and API URL. Leave the existing production deployment untouched.
2. Agree on separate read, upload, and export access policies. Prefer authenticated identity/session over a shared password for confidential records; keep any verifier only in server-controlled configuration and rotate exposed legacy credentials outside chat and source control.
3. Implement server-side authorization for every protected operation. CORS, hidden URLs, client-side hashing, and client-side export locks are not authorization.
4. Validate schema and nonempty usage before mutation. Stage incoming data, preserve a recoverable backup, verify counts/dates/receipts/stock, and prove rollback after simulated mid-write failure.
5. Test denied reads and exports, incorrect/cancelled credentials, failed and interrupted uploads, accepted upload persistence, cloud refresh, and local active-data rollback using only staging. Confirm production record counts or checksums are unchanged.
6. Review six-width UI screenshots, document an executable rollback plan, obtain explicit production smoke-test approval, and only then separately consider merge/deployment.

## Release checklist
- [x] Isolated browser/offline QA and visual screenshot review completed for the chart fix (run #68); QA head `54a1f70` passed run #74.
- [x] QA source quarantines legacy backend read/write and remote sync/upload; **not deployed**.
- [ ] Authorized owner verifies live deployment exposure and rotates legacy credentials as appropriate.
- [ ] Authenticated staging read/upload/export tests and failed-write recovery pass, with evidence that production is unchanged.
- [ ] Confirm security and CI results for the final proposed release commit, including this documentation update.
- [ ] Explicit production smoke-test approval and rollback plan are recorded before any merge/deployment.

**DRAFT: DO NOT MERGE OR DEPLOY.**