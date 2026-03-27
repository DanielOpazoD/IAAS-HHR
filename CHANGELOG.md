# Changelog

## [2.1.0] - 2026-03-27

### Added
- Multi-user role system (admin, pabellón, matronas) with per-collection write permissions
- Audit trail: `createdBy`/`updatedBy` uid stamps on all CRUD operations
- Admin user management page (`/admin/users`) with role assignment
- PendingApprovalPage for users without assigned role
- UserService for profile CRUD (Firebase + localStorage dual mode)
- E2E tests with Playwright — 18 tests covering navigation, CRUD flow, dashboard
- `data-testid` attributes on key UI components for E2E testability
- Proper `htmlFor`/`id` label-input association in FormField (accessibility)

### Changed
- AuthContext expanded with `role`, `canWrite()`, user profile management
- useCollection enforces write permissions by role, injects audit trail fields
- GenericDataPage hides add/edit/delete when user lacks write permission
- Sidebar shows "Usuarios" link only for admin role
- FormField now uses `cloneElement` to inject `id` for label association

### Improved
- 103 unit tests + 18 E2E tests passing
- Full CRUD E2E coverage: create, edit, delete, cancel, escape-close
- Accessibility: labels properly linked to inputs via htmlFor

## [2.0.0] - 2026-03-26

### Added
- Unsaved changes warning — browser "Leave page?" dialog when form modal is open
- Loading indicator on form submit — spinner + "Guardando..." + disabled buttons
- Offline indicator — amber banner "Sin conexión a internet" when offline
- Date validation in DipForm — prevents fechaRetiro < fechaInstalacion
- Duplicate record warning — yellow banner when same RUT + mes already exists (non-blocking)
- Print CSS — professional layout with hospital header, landscape tables, hidden UI
- 19 Firebase error codes mapped to friendly Spanish messages

### Changed
- FormActions component now accepts `loading` prop
- All 5 forms accept `loading` + `onFormChange` props
- FormComponentProps interface updated with new optional props
- getErrorMessage returns friendly messages for known Firebase error codes
- GenericDataPage manages `saving` state and duplicate detection

## [1.2.0] - 2026-03-26

### Added
- `useRutField` shared hook — eliminates 5× duplicated RUT validation logic
- `getErrorMessage` utility — consistent error extraction (Firebase, standard, unknown)
- `MESES_CORTOS` constant — centralized short month names
- `CX_PARTOS_SOURCE_MAP` — data-driven mapping replaces 30 lines of hardcoded conditionals
- JSDoc documentation for Firestore service functions
- Default error handler for Firestore `subscribe` (logs to console if no handler provided)
- `aria-invalid` attribute on RUT inputs for accessibility
- Tests for `useRutField` hook (7 tests) and `getErrorMessage` utility (4 tests)

### Changed
- All 5 form components refactored to use `useRutField` hook
- DipForm: fixed unstable `useEffect` dependency array (was creating new string every render)
- ConsolidacionPage: replaced hardcoded if-chain with `CX_PARTOS_SOURCE_MAP` lookup
- DashboardPage: now imports `MESES`/`MESES_CORTOS` from shared constants
- All error handlers now use `getErrorMessage` for consistent Firebase error display
- Fixed ESLint warnings (unused vars in arepiExport, ImportPage, utils)

### Improved
- 77 total tests passing (up from 66)
- Cleaner error messages with Firebase error codes

## [1.1.0] - 2026-03-26

### Added
- Lazy route loading with React.lazy + Suspense (code splitting)
- Toast notification system for CRUD feedback
- Focus trap in modal dialogs (accessibility)
- Surgery type filter in Cirugías Trazadoras view
- Form validation with RUT verification
- `.env.example` for environment variable documentation
- `useMemo` optimization in Dashboard and Consolidación pages
- ErrorBoundary component for graceful error recovery
- ConfirmDialog with async/await pattern
- Generic `useFormState` hook for all forms

### Changed
- Refactored 5 page files into single GenericDataPage pattern
- Improved Modal accessibility (ARIA attributes, focus trap)
- Extracted shared FormActions component

## [1.0.0] - 2026-03-25

### Added
- Initial release with 5 epidemiological surveillance modules
- Excel import from ministerial spreadsheet format
- Unified Excel export (all modules in one workbook)
- Per-module Excel export with styled formatting
- Consolidación de Tasas with IRM comparison
- Firebase Firestore + Auth integration
- Demo mode with localStorage fallback
- Dashboard with stats, alerts, and monthly distribution
- Chilean RUT validation and formatting
- Unit tests for utilities (dates, rates, RUT)
