# Rwaq Admin Panel MFE

Global-Staff administration panel for the **Rwaq** Arabic-language Open edX (Ulmo) platform. Built as a sibling MFE alongside `frontend-app-authoring`, `frontend-app-authn`, `frontend-app-learning`, and `frontend-app-learner-dashboard`.

## Stack

| Package | Version |
|---------|---------|
| `@edx/frontend-platform` | `^8.3.0` |
| `@openedx/paragon` | `^23.15.1` |
| `@openedx/frontend-build` | `14.6.2` |
| `react` | `^18.3.1` |
| `react-router-dom` | `^6.0.0` |
| `@tanstack/react-query` | `5.89.0` |
| `recharts` | `^2.x` |

TypeScript-first. State managed via TanStack Query (server state) and URL search params (filter/sort/pagination state). No Redux.

## Development

```sh
# Install dependencies
npm install

# Start dev server (port 2002, path /rwaq-admin/)
npm run dev

# Type check
npm run types

# Lint
npm run lint

# Test
npm run test

# Production build
npm run build
```

## Deployment (tutor-indigo)

This MFE is registered in `tutor-indigo/tutorindigo/plugin.py` under `_add_my_mfe` on port **2002** with `APP_ID=rwaq-admin` and `PUBLIC_PATH=/rwaq-admin/`. It is also listed in `indigo_styled_mfes` so that the Rwaq brand package and Paragon token CSS are injected automatically at build time.

After modifying `plugin.py`:

```sh
tutor config save
tutor images build mfe
```

Feature flag `ENABLE_ADMIN_PANEL` follows the standard three-hop path: `config.yml` → `CONFIG_DEFAULTS` + `patches/mfe-lms-common-settings` → `getConfig()` in this MFE.

## Access control

All routes require the authenticated user to have `is_staff=True` (Django Global Staff). The guard runs client-side as defense-in-depth; every backend endpoint enforces `IsGlobalStaff` independently.

## Module roadmap

| Module | Status | Backend |
|--------|--------|---------|
| Organizations | Live | Merged (`/rwaq/api/organizations/`) |
| Users | Coming soon | Spike in progress (`/rwaq/api/users/`) |
| Enrollment | Coming soon | Pending |
| Analytics / Dashboard | Placeholder data | Analytics spike completed; new `rwaq-features` endpoint + ClickHouse needed |

## Architecture

- `src/components/shell/` — `AdminShell`, `SideNav`, `PageHeader`, `FilterBar`
- `src/components/` — `KpiCard`, `AdminDataTable`, `EmptyState`, `ErrorState`, `LoadingPage`
- `src/components/charts/` — `MetricChart` (single Recharts wrapper; all other components import this, never `recharts` directly)
- `src/modules/dashboard/` — Dashboard with placeholder KPI + chart data
- `src/modules/organizations/` — Full Org list + detail wired to the live `/rwaq/api/organizations/` API
- `src/data/` — shared `utils.ts` (`getApiUrl`) and `constants.ts`

Each module has its own `data/api.ts` (backend seam) and `data/hooks.ts` (TanStack Query hooks). Components import hooks only, never `api.ts` directly.
