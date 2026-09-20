# FuelPTPSG — safe release and backend handoff

Status: NOT APPROVED FOR PRODUCTION. This document is a handoff, not proof of deployment.

## Non-negotiable constraints
- The current Google Apps Script deployment and production spreadsheet are out of scope: no credentials or edit access are available. Never run `setupDatabase()`, `replace`, or upload against the production endpoint as a test.
- Do not put a password, its reusable SHA-256 verifier, API token, or private spreadsheet data in GitHub Pages, repository source, logs, screenshots, or issue comments. A public GitHub Pages site cannot enforce server-side access to a downloadable export or an unauthenticated `latest` endpoint.
- Existing dashboard production remains unchanged until explicit release approval and verified rollback.

## Current blockers (source audit)
1. `backend/Code.gs` embeds `PASSWORD_SHA256` in public source; `v770-remote-sync.js` embeds the same verifier and stores a plaintext password on `window`.
2. `backend/Code.gs` serves `action=latest` without authentication. Decide explicitly whether all fuel records are public. If not, require server-side authorization on every data retrieval and export path; client-side dialogs do not protect public files or API responses.
3. `processUploadedFile` invokes `applyDataset(data)` before `pushPayload(data)` succeeds. Failed uploads can therefore replace local active data despite a cloud failure.
4. Upload writes multiple sheets in sequence, clearing each before writing. A mid-write failure can leave a partial database; implement a staging/commit or backup-and-restore strategy before production replacement.
5. Browser QA uses mocked/blocked cloud traffic; a passing visual test does not verify live cloud sync.

## Backend owner handoff (no secrets in chat)
1. Identify an authorized Apps Script owner, or create a separate backend and test spreadsheet under an authorized account. Keep the existing deployment untouched.
2. Store a new credential verifier only in server-controlled configuration (for example Script Properties), rotate the old credential after the new backend is deployed, and use server-side checks for upload. Prefer authenticated identity/session over a shared password for confidential records. Never send the credential to the repository or chat.
3. Define an access policy for read, upload, and export separately. If reads must be private, use a backend/platform that reliably authenticates requests and enforces access for the chosen hosting model. Do not treat CORS, obscured URLs, or frontend hashing as authorization.
4. Implement transactional replacement using a staging dataset, validation, and a recoverable backup. Reject malformed/empty usage before any live mutation; verify record counts, dates, receipts, and stock after commit.
5. Configure a TEST-only API URL and test-only spreadsheet. Test wrong/cancelled credentials, server failure, interrupted write, read permissions, export permissions, and successful upload. Compare pre/post production checksums or record counts to demonstrate production unchanged.
6. Only after tests pass, review screenshots for 360/390/768/1024/1366/1920, verify actual cloud refresh, approve rollback procedure, and merge/deploy in a separately authorized release step.

## Release gates
- `node tests/security-release-gate.cjs` must pass, but its regex checks are only a static guard, not a security audit.
- Playwright chart and navigation tests must pass on all six viewports, with screenshots inspected after animations settle.
- Test-backend integration must prove no active-data change on rejected upload and correct persistence after accepted upload.
- Export routes must be enumerated and checked against the agreed access policy; a client-side password alone is not security.
- No merge to `main` and no production upload until all gates are verified and the owner explicitly approves.
