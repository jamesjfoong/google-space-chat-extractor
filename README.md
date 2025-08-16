# Google Space Chat Extractor

## Usage

Extracting Chat Messages

1. Click Chat Extractor > Extract Chats in the spreadsheet menu
2. In the dialog that appears:
   - Choose a start date and end date for message extraction
   - Click "Extract Chats"
3. The extraction process will begin with progress updates shown in the dialog
4. When complete, a new sheet will be created with all extracted messages

## Exporting as CSV

After extraction completes:

1. Click the "Copy as CSV" button in the dialog
2. The CSV data will be copied to your clipboard

"Prompt Template:

**Context:**
You are a professional summarizer working with the CATAPA HRIS development team.
Your task is to create a structured, comprehensive summary of the team discussions that took place during a specific week. The content for summarization will be provided in the attached text file containing chat messages from the team's communication space.

**Your task:**

1. Carefully analyze all chat messages in the provided text file.
2. Identify key discussion points, decisions, action items, and unresolved issues.
3. Create a well-organized summary using a exact style shown below. Use normal heading only.
4. There could be multiple threads in a space, please refer to Thread ID.
5. Highlight any critical issues or blockers that require immediate attention.
6. Keep the summary professional, clear, and easily scannable.
7. Maintain an objective tone throughout.

**Team overview:**

- Team Responsibility: <brief description of your team’s scope>
- Team Structure:
  - PM:** <Name>
  - Front-end SDE: <Name>
  - Back-end SDE: <Name>
  - UX Designer: <Name>
  - QA Engineer: <Name>

**Output format:**

1. **<Topic Title 1>** – <Brief subtitle if any>
    1. <Summary 1-1>
    2. <Summary 1-2>
2. **<Topic Title 2>** – <Brief subtitle if any>
    1. <Summary 2-1>"

## Spreadsheet Structure

The extracted data is organized with the following columns:
Space Name: Name of the Chat space
Thread ID: Identifier for the message thread
Sender Name: Display name of the message sender
Message Text: The content of the message
Message Time: Timestamp when the message was sent
Message URL: Direct link to view the message in Google Chat
Message Type: Indicates if the message is a thread starter or reply
In Time Range: Notes whether the message falls within your selected date range

## References

Weekly Report: CATAPA Discussion at Google Chat Template

## Troubleshooting

If the chat extractor modal doesn't appear, it’s usually due to not granting all the required permissions during the initial prompt. Please follow these steps:

1. Go to <https://myaccount.google.com/connections>.
2. Look for CATAPA Infra and click Remove all access.
3. Then, try using the chat extractor again.

If you believe you’ve already granted all permissions but it's still not working, it
could be due to a browser extension. Try the following:

1. Open this spreadsheet in Incognito/Private mode.
2. Or try using a different browser.
