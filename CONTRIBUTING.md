# Contributing to Google Space Chat Extractor

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Ways to Contribute

### 1. **Bug Reports**
- Use GitHub Issues to report bugs
- Include detailed steps to reproduce
- Provide error messages and logs
- Specify your Google Workspace setup

### 2. **Feature Requests**
- Open an issue with the "enhancement" label
- Describe the use case and expected behavior
- Consider implementation complexity

### 3. **Code Contributions**
- Fork the repository
- Create a feature branch
- Make your changes
- Test thoroughly
- Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Google Workspace account
- Google Apps Script access
- Basic JavaScript knowledge
- Understanding of Google APIs

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/jamesjfoong/google-space-chat-extractor.git
   cd google-space-chat-extractor
   ```

2. **Set up Google Apps Script**:
   - Create a new Google Sheets document
   - Open Apps Script editor (`Extensions` → `Apps Script`)
   - Copy `code.gs` content into the editor

3. **Enable APIs**:
   - Google Chat API
   - People API (optional)
   - Admin SDK API (optional)

## 📝 Code Style Guidelines

### JavaScript Standards
- Use ES6+ features where supported by Apps Script
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for functions

### Example:
```javascript
/**
 * Extracts messages from a Google Chat space
 * @param {string} spaceId - The space identifier
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @return {Object} Extraction results
 */
function extractMessages(spaceId, startDate, endDate) {
  // Implementation here
}
```

## 🧪 Testing

### Manual Testing
- Test with different Google Chat spaces
- Verify date range filtering
- Test concurrent user scenarios
- Validate CSV export functionality

### Test Cases to Cover
- Empty spaces
- Large message volumes (1000+ messages)
- Different message types (text, attachments, etc.)
- Thread organization
- Error handling scenarios

## 📋 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Add to CHANGELOG.md** under "Unreleased"
4. **Ensure code follows style guidelines**

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested with small datasets
- [ ] Tested with large datasets (1000+ messages)
- [ ] Tested concurrent user scenarios
- [ ] Verified CSV export works

## Screenshots (if applicable)
Add screenshots of UI changes

## Additional Notes
Any additional context or considerations
```

## 🎯 Priority Areas for Contribution

### High Priority
1. **Rate Limiting**: Add delays between API calls to prevent quota issues
2. **Retry Logic**: Implement exponential backoff for failed requests
3. **Error Handling**: More specific error messages and recovery options
4. **Performance**: Optimize for very large datasets

### Medium Priority
1. **Export Formats**: Add JSON, Excel export options
2. **Filtering**: Add sender, keyword, or content type filters
3. **Scheduling**: Automated extraction scheduling
4. **Analytics**: Basic message statistics and insights

### Low Priority
1. **UI Improvements**: Better dialog design and user experience
2. **Localization**: Support for different languages
3. **Themes**: Dark mode and custom styling options

## 🐛 Bug Report Template

When reporting bugs, please include:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Google Workspace type: [Personal/Business/Education]
- Browser: [Chrome, Firefox, Safari, etc.]
- Google Sheets version: [if known]

**Additional context**
Any other context about the problem.
```

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Email**: For security-related issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to make this tool better for everyone!** 🎉 