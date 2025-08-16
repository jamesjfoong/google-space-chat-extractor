# Changelog

All notable changes to the Google Space Chat Extractor will be documented in this file.

## [Unreleased]

### Added
- Comprehensive README with installation instructions
- Project structure improvements
- Better error handling documentation

### Changed
- Improved documentation structure
- Enhanced troubleshooting section

## [1.1.0] - 2024-08-16

### Added
- **Multi-user concurrent support**: Each user gets isolated sessions
- **Session-based status tracking**: No interference between users
- **Unique sheet naming**: Prevents conflicts in multi-user environments
- **Unlimited message extraction**: Removed artificial 1000 message limit
- **Unlimited pagination**: Removed 10-page limit for large extractions

### Changed
- **Improved concurrency**: Users can now extract simultaneously without conflicts
- **Better progress tracking**: Session-specific status updates
- **Enhanced CSV export**: Each user gets their own data

### Fixed
- **Concurrency issues**: Multiple users no longer interfere with each other
- **Pagination limits**: Can now extract all available messages
- **Status message conflicts**: Each user sees only their own progress

## [1.0.0] - 2024-08-16

### Added
- **Initial release** of Google Space Chat Extractor
- **Message extraction** from Google Chat spaces with date filtering
- **Thread organization**: Automatic detection of thread starters and replies
- **CSV export functionality**: One-click export to clipboard
- **Progress tracking**: Real-time status updates during extraction
- **Spreadsheet formatting**: Color-coded output with conditional formatting
- **Direct message links**: Clickable URLs to original messages
- **Sender name resolution**: Uses People API and Directory API for accurate names
- **Date range filtering**: Flexible start and end date selection
- **Space selection**: Dropdown list of available Google Chat spaces

### Features
- Extract messages from any accessible Google Chat space
- Organize messages by threads with proper chronological ordering
- Export data as CSV for external analysis
- Support for large message volumes with pagination
- Real-time progress updates during extraction
- Formatted spreadsheet output with hyperlinks
- Comprehensive error handling and logging

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backwards compatible manner  
- **PATCH**: Backwards compatible bug fixes 