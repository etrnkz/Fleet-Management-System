# Postman assets

All backend Postman collections and environments live under this folder.

## Layout

| Path | Purpose |
|------|---------|
| `collections/` | Collection JSON (import into Postman) |
| `environments/` | Environment JSON (set `base_url`, tokens, IDs) |
| `.postman.json` | Local metadata (workspace/collection names, default `baseUrl`) — optional for IDE integrations |

## Import

1. **Postman** → Import → choose files from `collections/` and `environments/`.
2. Select **Fleet Management Environment** (or duplicate and rename for staging/prod).
3. Set `base_url` to your API (default `http://localhost:3000` if Nest listens there).

## Files

- `collections/Fleet_Management_Complete_Workflow.postman_collection.json` — full trip workflow (folder **1. Authentication** includes logins for employee chain, **Deployment Office** (`deployment@test.com`), **Admin / Transport Office** (`transport@test.com`), **Driver**, **Developer**, and **System Admin**)
- `collections/Fleet_Management_API_Test.postman_collection.json` — API smoke tests
- `environments/Fleet_Management_Environment.postman_environment.json` — shared variables (`base_url`, role tokens, entity IDs)

Collections should use `{{base_url}}` (underscore) to match the bundled environment.

## Automated tests (Newman)

From the `Backend` directory, with the API already running on `base_url` (default `http://localhost:3000`):

```bash
npm install
npm run test:postman
```

- **`test:postman`** — runs `Fleet_Management_API_Test` (health, API root, public signup-metadata). Each request has **Tests** scripts so Newman asserts status and JSON shape.
- **`test:postman:workflow`** — runs the full trip workflow collection. Expect failures unless users/tokens exist (run `create_test_users.py` and use Postman to capture tokens first).
- **`test:postman:report`** — same as smoke, writes `postman/reports/newman-smoke.json` (folder is gitignored except `.gitignore`).

CI: GitHub Actions workflow `.github/workflows/postman-smoke.yml` builds the backend, starts `start:prod`, waits on `GET /api/v1/health`, then runs `npm run test:postman`.
