# Changelog

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
