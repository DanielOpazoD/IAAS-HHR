# Changelog

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
