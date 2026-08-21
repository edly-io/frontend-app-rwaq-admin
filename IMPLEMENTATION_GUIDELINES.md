# Rwaq Admin Panel MFE — Implementation Guidelines

**All new work in this MFE MUST follow these rules.** They are derived from a pattern audit of
the sibling Rwaq Ulmo MFEs — `frontend-app-authoring` (responsive UI + forms; our closest
sibling), `frontend-app-learner-dashboard` (theming), `frontend-app-learning` (architecture) —
reconciled with what this MFE already established. Full audits: `docs/research/mfe-analysis-*.md`
in the workspace root.

> Golden rule: **prefer Paragon components + utility classes + `--pgn-*` design tokens.** Only
> write custom CSS/inline styles for what those genuinely can't express.

---

## 1. Stack (do not drift)
`@edx/frontend-platform ^8.3` · `@openedx/paragon ^23.15` · `@openedx/frontend-build 14.6.2` ·
React 18 · react-router-dom 6 · **TanStack Query** for server state (matching `frontend-app-authoring`).

## 2. Project structure — feature modules with a data seam
```
src/
  modules/<feature>/           # one folder per feature (users, organizations, dashboard…)
    data/api.ts                # HTTP ONLY — getAuthenticatedHttpClient + getApiUrl; the single
                               # place that changes when the backend changes
    data/apiHooks.ts (hooks.ts)# TanStack Query hooks (query-key factory + mutations)
    data/types.ts
    <Feature>Page.tsx          # page/container: owns state, composes subcomponents
    modals/…, components/…     # subcomponents: pure, prop-driven, no own fetching
  components/                  # cross-feature reusable primitives (AdminDataTable, KpiCard, states)
  components/shell/            # the app chrome (AdminShell, SideNav, TopBar) — deliberate custom design
```
- **Components call `apiHooks`/`hooks.ts` ONLY — never import `api.ts`/the raw client directly.** (Universal across all three sibling MFEs.)
- Colocate `messages` (via `defineMessages`) and tests next to what they belong to. No giant central message file.
- **camelCase everything above the API boundary.** If a backend returns snake_case, normalize in `api.ts` (`camelCaseObject` from `@edx/frontend-platform`); the rest of the app never sees snake_case.
- Naming: components `PascalCase`; hooks `useX`; constants `UPPER_SNAKE_CASE`; files ≤ 800 lines (target 200–400).

## 3. Config
Read config only via `getConfig()`. Declare any new `ENABLE_*` / URL var once in `src/index.tsx`'s `mergeConfig({...}, 'RwaqAdminAppConfig')`, each defaulting to `|| null`. **Never `process.env.X` inside components.** (Three-hop path: Tutor config → MFE env → `getConfig()`.)

## 4. Theming — use the platform, don't hand-roll it
`<AppProvider>` (from `@edx/frontend-platform/react`) **already** loads Paragon theme CSS, gates on `isThemeLoaded` (no FOUC), detects OS `prefers-color-scheme`, persists to `localStorage['selected-paragon-theme-variant']`, and sets `data-paragon-theme-variant` on `<html>` — the attribute all light/dark CSS keys off.
- **DO** — for a user-facing theme toggle, call `AppContext.paragonTheme.setThemeVariant('light'|'dark')`. Read state from `AppContext.paragonTheme.state`.
- **DON'T** — write a custom theme provider / manual `<link>` swapping / a hand-rolled hook that sets the attribute yourself. That fights the framework.
- **DO** keep `PARAGON_THEME_URLS={}` in every `.env*` (the build injects a local fallback; deployed envs get real URLs from tutor-indigo).
- **`@edx/brand`** is the brand-override layer — never `import` it in app code; the Paragon webpack plugin consumes it.

> ⚠️ **Exception, with a reason: this app owns `data-paragon-theme-variant` itself.**
> Paragon ships **no dark theme** — `@openedx/paragon/styles/css/themes/` contains
> `light` only, and the Rwaq brand's dark stylesheet lives in a private repo whose raw
> URL 404s in a browser. With no dark variant registered, `setThemeVariant('dark')`
> stores the preference and then **removes** the attribute rather than setting it
> (verified in a browser: localStorage `"dark"`, attribute `null`). Since every dark
> rule in `shell.scss` keys off that attribute, the whole dark theme silently fails.
> So `useThemeVariant` lets Paragon own persistence and OS detection, and mirrors the
> resolved variant onto the attribute itself. Covered by `e2e/theme.spec.ts`. If a
> real dark stylesheet is ever wired up, this mirror can go.

## 5. Layout & responsiveness
- **Content pages:** wrap page content in Paragon **`<Container size="xl" className="p-4 mt-3">`** (`size="md"` for a narrow single-purpose form). Loading/error states reuse the **same** wrapper so width never jumps.
- **Page-level 2-column:** Paragon **`Layout` / `Layout.Element`** with **explicit `xs/sm/md/lg/xl` spans**, and the side column collapsing to `span: 12` at `sm`/`xs`. Never leave a 2-col layout two-column down to mobile.
- **Field-level side-by-side:** `Row`/`Col` with `xs={12} md={6}`.
- **Import once** at the SCSS entry: `@use "@openedx/paragon/styles/css/core/custom-media-breakpoints.css"`.
- **JS-level responsive behavior:** shared `useIsMobile()`/`useIsDesktop()` hooks (`react-responsive`), not ad-hoc inline media queries.
- **No hardcoded page-level pixel widths.** Inline `maxWidth` is acceptable only on a small widget (e.g. one `<select>`), never a page container.
- **The shell** (`SideNav`/`TopBar`) is a deliberate custom edly-panel design — keep it, but migrate its inline styles to the `shell.scss` tokens over time; new **content** must use the Paragon/`Container`/`Layout` patterns above.

## 6. Forms & fields
- **Formik + Yup** for any form with >1–2 fields. `enableReinitialize: true` when initial values come from an async fetch. Gate inline errors on `formik.touched.<f> && !!formik.errors.<f>`.
- **Canonical field block:**
  ```tsx
  <Form.Group isInvalid={touched && !!error} className="mb-4">
    <Form.Label>{intl.formatMessage(messages.x)}</Form.Label>
    <Form.Control name="x" value={v} onChange={formik.handleChange} onBlur={formik.handleBlur} />
    {touched && error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
  </Form.Group>
  ```
- **Spacing:** `Form.Group` → `mb-4` (standalone editable field); `mb-0` on the last field in a card; `mb-3` for read-only label/value stacks.
- **Do NOT override `Form.Control` height/width** — Paragon's default sizing (`--pgn-size-form-input-*`) is the standard.
- Hints: `<Form.Text muted>`. Textareas: `as="textarea" rows={n}` (no height CSS). Enums: `<Form.Control as="select">`.
- **NEVER use TinyMCE (or any WYSIWYG/rich-text editor) in this MFE.** Not for biographies, notes, descriptions — anything. Admin free-text fields are plain `as="textarea"`. Reasons: it drags in a heavy third-party bundle for a field that holds two sentences; it emits HTML into columns that consumers render as **text**, so markup leaks into learner-facing pages; and it can't be styled to match the Paragon field system. If a field genuinely needs structured content, raise it as a decision — don't reach for an editor.
- **Field hints that explain how to fill a field in belong on focus, not permanently.** Show them while the input has focus and hide them on blur (`onFocus`/`onBlur` + local state), so a long form isn't a wall of standing advice. Hints that state a permanent constraint ("accounts are never deleted") can stay visible.
- **Booleans/toggles:** Paragon `Form.Switch` / `SwitchControl` inside a `Form.Group` — **never** a raw `<input type="checkbox">` + manual `<label>`.

## 7. Modals
- Paragon **`ModalDialog`**; set **`isFullscreenOnMobile`** on every list/search/form modal (the single most important prop for mobile screen-fit). `size="lg"` for content-heavy.
- Header/body/footer with `ModalDialog.Header/Body/Footer` + `ActionRow` for buttons.
- **Destructive confirm:** a reusable confirm modal built on `AlertModal` + a loading/disabled action button (port `frontend-app-authoring`'s `DeleteModal` shape).
- Inside a modal, async content follows the **triad**: `Alert variant="danger"` (error) · centered `Spinner` (loading) · muted centered text (empty).

## 8. Tables
- **Small, static lists (tens of rows):** plain mapped rows (or our `AdminDataTable` in simple mode). Don't reach for full `DataTable` machinery for a handful of rows.
- **Large / sortable / filterable / paginated:** Paragon `DataTable` (`isSortable isFilterable isPaginated`) — this is what our `AdminDataTable` wraps.
- **Card-grid layouts:** use the breakpoint ladder `columnSizes={{ xs:12, sm:6, md:4, lg:3, xl:2 }}` — don't invent new breakpoints.

## 9. Feedback, loading, error, empty
- **Toasts for mutation success/error** — use a `ToastContext` (`showToast(message)`), consistent app-wide. `Alert` is for *persistent inline* states only (unsaved-changes banner, empty-list message).
- **Status states:** every data view handles Loading / Empty / Error explicitly (we have `LoadingPage`, `EmptyState`, `ErrorState`). For org/permission-scoped screens, treat **403/forbidden as a distinct state** from a network failure.
- **Never swallow errors** — `logError()` (from `@edx/frontend-platform/logging`) on failures.

## 10. Styling
- **Utility classes first** (`mb-4 mt-3 d-flex align-items-center justify-content-between gap-2 flex-wrap small text-muted`). Add a feature `.scss` only for what utilities can't express (min-height guards, pseudo-elements, keyframes).
- **`--pgn-*` design tokens for every color/spacing/size/typography value** in custom CSS — never hardcode hex/px that has a token. Our design-system tokens live in `src/components/shell/shell.scss`; extend there, not ad hoc.
- Dark mode: rely on tokens flipping via `data-paragon-theme-variant`; our custom chrome has explicit dark overrides in `shell.scss` — keep new custom surfaces token-driven so they flip automatically.

## 11. i18n & testing
- All user-facing strings via `defineMessages` + `intl.formatMessage(...)` — no hardcoded UI strings.
- Jest + `@testing-library/react` via `@openedx/frontend-build`'s preset. Colocate `*.test.tsx`. A shared `setupTest` `render()` wrapper (Intl/AppProvider/QueryClient). Test the `apiHooks` seam + component render/interaction; don't shallow-render.

---

## DO / DON'T — master list
**DO:** Paragon components + utility classes + `--pgn-*` tokens · `Container size="xl"` pages · `Layout` with all five breakpoints · Formik+Yup forms with `mb-4` groups · Paragon-default field sizing · `Form.Switch` for booleans · `ModalDialog` + `isFullscreenOnMobile` · `data/api.ts`+`apiHooks.ts` seam (hooks-only from components) · camelCase at the API boundary · `getConfig()`/`mergeConfig` for config · `AppContext.paragonTheme.setThemeVariant()` for theming · Toasts for mutations · colocated messages/tests.

**DON'T:** use TinyMCE or any rich-text editor · hand-roll a theme provider/hook · hardcode hex/px that has a `--pgn-*` token · override `Form.Control` height/width · use raw `<input type=checkbox>` for booleans · build page-level width/columns with custom/inline CSS · import `api.ts`/the raw client from components · read `process.env` in components · use a full `DataTable` for a few rows · swallow errors · skip the loading/empty/error states (incl. 403-distinct) · centralize all i18n in one file.

## 12. Shared components — reuse before building
These live in `src/components/` and every screen is expected to use them rather than re-solving the same problem:

| Component | Use for |
|---|---|
| `SearchFilterBar` | The whole search + filter/sort + applied-chips action bar. Generic over scopes/groups/chips — pass config, don't fork it. |
| `AdminDataTable` | Any list. **Pass `pagination.pageSize`** matching what the API returns, or the footer's range and page count disagree with the data. |
| `FormModal` | Any modal containing a form. Fixes the ModalDialog-plus-`<form>` trap (see below) once, for everyone. |
| `DetailGrid` | Read-only label/value views. Groups of aligned pairs, `isWide` for prose. |
| `ChipOverflowList` | Chip lists in table cells — shows N then `+M`, keeping row heights uniform. |
| `ProfileAvatar` | Any user image. Handles both fallback cases (platform default path, load failure). |
| `ToastContext` (`useToast`) | Mutation success/error feedback. |

Two traps these encode, worth knowing even if you never read their source:
- **A `<form>` wrapping `ModalDialog.Header/Body/Footer`** breaks the dialog's flex column: the Body stops being the scroll container and its content scrolls *over* the header. `FormModal` fixes it with `display: contents` on the form. Don't assemble form modals by hand.
- **A profile image URL being present doesn't mean an image exists** — the platform returns a default-avatar path that 404s in this deployment. `ProfileAvatar` drops known-default paths and handles `onError`.

## Reconciliation with the current codebase (fix-forward)
- ✅ Keep: TanStack Query + `data/api.ts`/`hooks.ts` seam · `.rwaq-page`/`.rwaq-card` design system · custom sidebar/topbar shell (edly-panel design) · dark-mode tokens in `shell.scss`.
- 🔧 Fix: refactor `useThemeVariant` → `AppContext.paragonTheme.setThemeVariant` · migrate shell inline styles to `shell.scss`/tokens over time · adopt Formik+Yup + `Container`/`Layout` + `ToastContext` for the Users v2 forms/modals (replacing the current inline-Alert approach).
