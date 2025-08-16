# Google Space Chat Extractor

A Google Apps Script tool for extracting and analyzing chat messages from Google Chat spaces. Perfect for team communication analysis, meeting summaries, and project documentation.

## ✨ Features

- **📥 Message Extraction**: Extract messages from any Google Chat space with date range filtering
- **🧵 Thread Organization**: Automatically identifies and organizes thread starters and replies
- **👥 Multi-User Support**: Concurrent user sessions with isolated data processing
- **📊 Multiple Export Formats**: CSV, JSON, and Excel exports with different use cases
- **☁️ Google Drive Integration**: Direct Excel export to Google Drive with shareable links
- **🔗 Direct Links**: Clickable links to original messages in Google Chat
- **📈 Progress Tracking**: Real-time status updates during extraction
- **🎨 Formatted Output**: Color-coded spreadsheet with conditional formatting
- **⚡ Unlimited Messages**: No artificial limits on message extraction

## 🛠️ Installation

### Prerequisites
- Google Workspace account with access to Google Chat
- Google Sheets access
- Permissions to create Google Apps Script projects

### Setup Instructions

1. **Create a new Google Sheets document**
2. **Open Apps Script Editor**:
   - Go to `Extensions` → `Apps Script`
3. **Replace the default code**:
   - Delete the existing `Code.gs` content
   - Copy and paste the entire `code.gs` file from this repository
4. **Enable Required APIs**:
   - In Apps Script, go to `Services` (+ icon)
   - Add: `Google Chat API`
   - Add: `People API` (optional, for better name resolution)
   - Add: `Admin SDK API` (optional, for organization users)
5. **Save and Deploy**:
   - Save the project (`Ctrl+S`)
   - Refresh your Google Sheets document
   - You should see a new "Chat Extractor" menu

## 📖 Usage

### Extracting Chat Messages

1. **Open the Extractor**:
   - Click `Chat Extractor` → `Extract Chats` in the spreadsheet menu

2. **Configure Extraction**:
   - Select the Google Chat space from the dropdown
   - Choose start and end dates for message extraction
   - Click "Extract Chats"

3. **Monitor Progress**:
   - The extraction process shows real-time progress updates
   - Large extractions may take several minutes

4. **Review Results**:
   - A new sheet will be created with all extracted messages
   - Messages are organized by thread and chronologically sorted

### Exporting Data

1. **After extraction completes**:
   - Choose your preferred export format from the dropdown:
     - **CSV (Clipboard)**: Traditional comma-separated values for Excel/analysis tools
     - **JSON (Clipboard)**: Structured data with threading and metadata for developers
     - **Excel (Google Drive)**: Formatted spreadsheet saved directly to your Google Drive
   - Click the "Export Data" button

2. **Export Options**:
   - **CSV**: Simple tabular format, copied to clipboard
   - **JSON**: Rich structured format with thread organization, statistics, and metadata
   - **Excel**: Professional spreadsheet with formatting, saved to Google Drive with shareable link

3. **Use the data**:
   - **CSV**: Paste into Excel, Google Sheets, or data analysis tools
   - **JSON**: Perfect for developers, APIs, and advanced AI analysis
   - **Excel**: Share professional reports with stakeholders via Google Drive link

## 📊 Data Structure

### CSV Format
The CSV export includes these columns:

| Column | Description |
|--------|-------------|
| **Space Name** | Name of the Google Chat space |
| **Thread ID** | Unique identifier for the message thread |
| **Sender Name** | Display name of the message sender |
| **Message Text** | The actual message content |
| **Message Time** | Timestamp when the message was sent |
| **Message URL** | Direct link to view the message in Google Chat |
| **Message Type** | Thread Starter, Reply, or Direct Message |
| **In Time Range** | Whether the message falls within your selected date range |

### JSON Format
The JSON export provides a rich, structured format:

```json
{
  "metadata": {
    "extractedAt": "2024-08-16T12:00:00.000Z",
    "totalMessages": 150,
    "sessionId": "session_abc123",
    "spaceName": "Team Development"
  },
  "threads": {
    "thread_123": {
      "threadId": "thread_123",
      "messages": [...],
      "participants": ["Alice", "Bob", "Charlie"],
      "messageCount": 12,
      "threadStarter": {...}
    }
  },
  "directMessages": [...],
  "summary": {
    "messageTypes": {
      "Thread Starter": 15,
      "Reply": 120,
      "Direct Message": 15
    },
    "senders": {
      "Alice": 45,
      "Bob": 67,
      "Charlie": 38
    },
    "dateRange": {
      "earliest": "2024-08-10T09:00:00.000Z",
      "latest": "2024-08-16T17:30:00.000Z"
    }
  }
}
```

### Excel Format
The Excel export creates a formatted Google Sheets document with:
- **Bold headers** with background color
- **Auto-resized columns** for readability
- **Clickable hyperlinks** to original messages
- **Professional formatting** ready for sharing

## 🤖 AI Summarization

### Recommended Workflow

1. **Extract messages** using this tool
2. **Copy as CSV** to get the raw data
3. **Feed to AI tools** like ChatGPT, Claude, or Gemini with the prompt template below

### Sample Prompt Template

```
You are a professional summarizer analyzing team communication data.

**Context:** 
Analyze the attached CSV data containing chat messages from our team's Google Chat space.

**Task:**
1. Identify key discussion points, decisions, and action items
2. Organize by topics and threads
3. Highlight any critical issues or blockers
4. Maintain a professional, objective tone

**Output Format:**
- **Issues** (if any critical problems identified)
- **Decisions** (key choices made by the team)
- **Action Items** (tasks assigned with owners and deadlines)
- **Discussion Topics** (main conversation themes)
- **Achievements** (completed work and milestones)

Please provide a structured summary that any team member can reference to understand the current project status and next steps.
```

## 🔧 Advanced Configuration

### Customizing Date Ranges
- Default: Last 7 days
- Maximum: No limit (but consider Google Apps Script execution time limits)
- Tip: For very large extractions, use smaller date ranges

### Handling Large Datasets
- The tool automatically handles pagination
- No message limits (previous 1000 message limit removed)
- For spaces with 10,000+ messages, consider splitting by date ranges

### Multi-User Environments
- Each user gets an isolated session
- No interference between concurrent extractions
- Unique sheet names prevent conflicts

## 🐛 Troubleshooting

### Permission Issues
If the chat extractor modal doesn't appear:

1. **Reset Google Account Connections**:
   - Go to [Google Account Connections](https://myaccount.google.com/connections)
   - Find your Apps Script project and remove access
   - Try the extractor again and re-grant permissions

2. **Browser Issues**:
   - Try in Incognito/Private mode
   - Disable browser extensions temporarily
   - Use a different browser

### API Errors
- **"Repository not found"**: Check Google Chat API is enabled
- **Rate limiting**: Wait a few minutes and try again
- **Timeout errors**: Use smaller date ranges for large spaces

### Performance Issues
- **Slow extraction**: Normal for large datasets (1000+ messages)
- **Memory errors**: Restart the extraction with smaller date ranges
- **Execution timeout**: Google Apps Script has 6-minute limits for large operations

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- **Rate limiting**: Add delays between API calls
- **Retry logic**: Automatic retry for failed requests
- **Batch processing**: Handle very large datasets more efficiently
- **Export formats**: Add JSON, Excel export options
- **Filtering**: Add sender, keyword, or content type filters

## 📄 License

This project is open source. Feel free to modify and distribute.

## 🔗 References

- [Google Chat API Documentation](https://developers.google.com/chat/api)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Made for team communication analysis and project documentation** 📈
