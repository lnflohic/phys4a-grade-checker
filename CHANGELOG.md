# Changelog

## Version 2.1 - Bug Fixes (2026-02-11)

### Fixed
- **HTML Corruption**: Fixed malformed `data-target` attributes that prevented users from entering scores
  - Issue: Some checkboxes had nested HTML in their data-target attribute
  - Solution: Cleaned up all data-target attributes to use simple numeric values

- **F Grade Logic**: Fixed F grade being assigned too aggressively
  - Issue: F grade was the default when other grades didn't match, even if student was passing
  - Solution: F grade now correctly requires **ONE OR MORE** of the F conditions to be met:
    - Any physics or lab SLO < 1.3, OR
    - Missed 5 or more labs, OR
    - 3 or fewer physics SLOs ≥ 2.0 (scaled proportionally), OR
    - All lab SLOs < 2.0
  - If no grade criteria are met, defaults to D as reference

- **Duplicate Attributes**: Removed duplicate "disabled" and "checked" attributes in HTML

### How F Grade Works Now

According to the syllabus: **"F - One or more of the following:"**

The app now correctly interprets this as an OR condition, not AND:
- If you have ANY single F condition → Grade is F
- If you have ZERO F conditions but don't meet D criteria → Grade defaults to D
- Example: Student with all scores 2.0+ but missed 6 labs → Gets F (for missed labs)
- Example: Student with mostly 2.0+ but one SLO is 1.2 → Gets F (for SLO < 1.3)

## Version 2.0 - Scaled Requirements (2026-02-11)

### Added
- N/A checkboxes default to checked
- Dynamic requirement scaling based on evaluated SLOs
- Progress grade calculation with best/worst case scenarios
- Skip fully N/A categories in grade calculation

### Changed
- Removed PDF upload functionality
- Updated UI instructions for N/A workflow

## Version 1.0 - Initial Release

### Features
- Basic grade calculation
- Manual SLO entry
- Grade checklist display
- Performance summary statistics
