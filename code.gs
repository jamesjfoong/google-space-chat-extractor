/**
 * Google Chat Extractor
 * Extracts chat messages directly from Google Chat spaces and saves them to a spreadsheet.
 * Includes functionality to export data as CSV to clipboard.
 */

// Create a menu item when the spreadsheet opens
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Chat Extractor")
      .addItem("Extract Chats", "showExtractDialog")
      .addToUi();
  } catch (e) {
    Logger.log("Unable to create menu: " + e.toString());
  }
}

/**
 * Format a date for HTML date input (YYYY-MM-DD)
 */
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate a unique session ID for each user session
 * @return {string} Unique session identifier
 */
function generateSessionId() {
  return (
    "session_" +
    Utilities.getUuid().replace(/-/g, "").substring(0, 8) +
    "_" +
    Date.now()
  );
}

/**
 * Updates the extraction status for a specific session
 * @param {string} statusMessage - The status message to display
 * @param {string} sessionId - Unique session identifier
 */
function updateExtractionStatus(statusMessage, sessionId = "default") {
  PropertiesService.getScriptProperties().setProperty(
    `EXTRACTION_STATUS_${sessionId}`,
    statusMessage
  );
}

/**
 * Gets the current extraction status for a specific session
 * @param {string} sessionId - Unique session identifier
 * @return {string} The current status message
 */
function getExtractionStatus(sessionId = "default") {
  return (
    PropertiesService.getScriptProperties().getProperty(
      `EXTRACTION_STATUS_${sessionId}`
    ) || "Processing..."
  );
}

/**
 * Shows a dialog to configure extraction parameters
 */
function showExtractDialog() {
  const spaces = getChatSpaces();
  const spaceOptions = spaces
    .map((space) => `<option value="${space.id}">${space.name}</option>`)
    .join("");

  // Get default dates (last week to today)
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Format dates for input value
  const todayFormatted = formatDateForInput(today);
  const lastWeekFormatted = formatDateForInput(lastWeek);

  const html = HtmlService.createHtmlOutput(
    `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 10px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input, select {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
      }
      button {
        background-color: #4285f4;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        margin-right: 0;
        margin-bottom: 8px;
      }
      button:hover {
        background-color: #3367d6;
      }
      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      .loading {
        display: none;
        margin-top: 15px;
        text-align: center;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 2s linear infinite;
        margin: 0 auto 10px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #copyButtons {
        margin-top: 15px;
        display: none;
      }
      .copy-loading {
        display: none;
        margin-top: 5px;
        text-align: center;
      }
      .success-message {
        color: #34A853;
        font-weight: bold;
        margin-top: 10px;
        display: none;
      }
      .button-container {
        display: flex;
        align-items: center;
      }
      #copyCSVButton {
        background-color: #0f9d58;
      }
      #copyCSVButton:hover {
        background-color: #0b8043;
      }
      #statusMessage {
        margin-top: 10px;
        font-weight: 500;
        color: #4285f4;
      }
    </style>
    <div class="form-group">
      <label for="spaceId">Select Space:</label>
      <select id="spaceId">${spaceOptions}</select>
    </div>
    <div class="form-group">
      <label for="startDate">Start Date:</label>
      <input type="date" id="startDate" value="${lastWeekFormatted}">
    </div>
    <div class="form-group">
      <label for="endDate">End Date:</label>
      <input type="date" id="endDate" value="${todayFormatted}">
    </div>
    <button id="extractButton" onclick="extractChats()">Extract Chats</button>

    <div id="loadingIndicator" class="loading">
      <div class="spinner"></div>
      <p id="statusMessage">Initializing extraction...</p>
    </div>

    <div id="copyButtons" style="margin-top: 15px; display: none;">
      <button id="copyCSVButton" onclick="copyAsCSV()">Copy as CSV</button>
      <span id="copySuccess" class="success-message">Copied to clipboard!</span>
    </div>

    <div id="copyLoadingIndicator" class="copy-loading">
      <div class="spinner"></div>
      <p>Copying data to clipboard...</p>
    </div>

    <script>
      let lastSheetName = '';
      let statusInterval;
      let sessionId = '';

      // Generate unique session ID when dialog opens
      google.script.run
        .withSuccessHandler(function(id) {
          sessionId = id;
        })
        .generateSessionId();

      function updateStatus(status) {
        document.getElementById('statusMessage').textContent = status;
      }

      function extractChats() {
        const spaceId = document.getElementById('spaceId').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Hide copy buttons and success message when starting new extraction
        document.getElementById('copyButtons').style.display = 'none';
        document.getElementById('copySuccess').style.display = 'none';

        if (!startDate || !endDate) {
          alert('Please select both start and end dates.');
          return;
        }

        // Disable all inputs and button
        document.getElementById('extractButton').disabled = true;
        document.getElementById('spaceId').disabled = true;
        document.getElementById('startDate').disabled = true;
        document.getElementById('endDate').disabled = true;

        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';

        // Start polling for status updates
        statusInterval = setInterval(function() {
          google.script.run
            .withSuccessHandler(function(status) {
              updateStatus(status);
            })
            .getExtractionStatus(sessionId);
        }, 1000); // Poll every second

        google.script.run
          .withSuccessHandler(function(result) {
            // Stop polling
            clearInterval(statusInterval);

            // Hide loading indicator and re-enable form
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('extractButton').disabled = false;
            document.getElementById('spaceId').disabled = false;
            document.getElementById('startDate').disabled = false;
            document.getElementById('endDate').disabled = false;

            // Show copy buttons after extraction completes
            document.getElementById('copyButtons').style.display = 'block';

            // Store the sheet name for CSV export
            if (typeof result === 'object' && result.sheetName) {
              lastSheetName = result.sheetName;
            }

            const message = typeof result === 'object' ? result.message : result;
            alert('Chat extraction complete: ' + message);
          })
          .withFailureHandler(function(error) {
            // Stop polling
            clearInterval(statusInterval);

            // Hide loading indicator and re-enable form
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('extractButton').disabled = false;
            document.getElementById('spaceId').disabled = false;
            document.getElementById('startDate').disabled = false;
            document.getElementById('endDate').disabled = false;

            alert('Error: ' + error);
          })
          .extractChats(spaceId, startDate, endDate, sessionId);
      }

      function copyAsCSV() {
        // Disable copy button and show loading
        document.getElementById('copyCSVButton').disabled = true;
        document.getElementById('copySuccess').style.display = 'none';
        document.getElementById('copyLoadingIndicator').style.display = 'block';

        google.script.run
          .withSuccessHandler(function(csvData) {
            // Hide loading and re-enable button
            document.getElementById('copyCSVButton').disabled = false;
            document.getElementById('copyLoadingIndicator').style.display = 'none';

            // Create a temporary textarea element to copy from
            const textarea = document.createElement('textarea');
            textarea.value = csvData;
            textarea.style.position = 'fixed';  // Prevent scrolling to bottom
            document.body.appendChild(textarea);
            textarea.select();

            try {
              // Try to use the execCommand approach which works in most browsers
              const successful = document.execCommand('copy');
              if (successful) {
                // Show success message
                document.getElementById('copySuccess').style.display = 'inline';

                // Hide success message after 3 seconds
                setTimeout(function() {
                  document.getElementById('copySuccess').style.display = 'none';
                }, 3000);
              } else {
                throw new Error('Copy command was unsuccessful');
              }
            } catch (err) {
              // If clipboard copy fails, show a dialog with the CSV data
              google.script.run.showCSVDialog(csvData);
            } finally {
              // Clean up
              document.body.removeChild(textarea);
            }
          })
          .withFailureHandler(function(error) {
            // Hide loading and re-enable button
            document.getElementById('copyCSVButton').disabled = false;
            document.getElementById('copyLoadingIndicator').style.display = 'none';
            alert('Error generating CSV: ' + error);
          })
          .getExtractedDataAsCSV(sessionId);
      }
    </script>
  `
  )
    .setWidth(400)
    .setHeight(450); // Increased height to accommodate the copy button

  try {
    SpreadsheetApp.getUi().showModalDialog(
      html,
      "Extract Google Chat Messages"
    );
  } catch (e) {
    Logger.log("Unable to show dialog: " + e.toString());
  }
}

/**
 * Show CSV data in a dialog if clipboard API fails
 * @param {string} csvData - The CSV data to display
 */
function showCSVDialog(csvData) {
  const html = HtmlService.createHtmlOutput(
    `
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 10px;
      }
      textarea {
        width: 100%;
        height: 300px;
        margin-bottom: 10px;
        font-family: monospace;
      }
      button {
        background-color: #4285f4;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
    <h3>Copy the CSV data below</h3>
    <textarea id="csvContent">${csvData
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</textarea>
    <button onclick="copyTextarea()">Copy to Clipboard</button>
    <script>
      function copyTextarea() {
        const textarea = document.getElementById('csvContent');
        textarea.select();
        document.execCommand('copy');
        alert('Copied to clipboard!');
      }
    </script>
  `
  )
    .setWidth(600)
    .setHeight(400)
    .setTitle("CSV Data");

  SpreadsheetApp.getUi().showModalDialog(html, "CSV Data");
}

/**
 * Gets the available chat spaces
 * @return {Array} Array of space objects with id and name
 */
function getChatSpaces() {
  try {
    const response = Chat.Spaces.list();

    if (response && response.spaces && Array.isArray(response.spaces)) {
      return response.spaces
        .filter((space) => {
          // Check if the space has a proper display name
          const hasDisplayName =
            space.displayName &&
            space.displayName !== space.name &&
            !space.displayName.startsWith("spaces/");

          return hasDisplayName;
        })
        .map((space) => {
          return {
            id: space.name,
            name: space.displayName,
          };
        });
    } else {
      Logger.log("Unexpected spaces format");
      return [];
    }
  } catch (e) {
    Logger.log("Error in getChatSpaces: " + e.toString());
    return [];
  }
}

/**
 * Get the extracted data from the most recently created sheet and return as CSV
 * @param {string} sessionId - Session ID to get the correct sheet
 * @return {string} CSV formatted string of the data
 */
function getExtractedDataAsCSV(sessionId = "default") {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Get the name of the last extracted sheet from properties for this session
    const lastSheetName = PropertiesService.getScriptProperties().getProperty(
      `LAST_EXTRACTED_SHEET_${sessionId}`
    );

    let sheet;
    if (lastSheetName) {
      sheet = ss.getSheetByName(lastSheetName);
    }

    // If we couldn't find the sheet by name, fall back to using the active sheet
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return "No data found";
    }

    // Convert to CSV format
    let csvContent = "";

    // Process each row
    for (const row of data) {
      // Process each cell in the row
      const csvRow = row
        .map((cell) => {
          // Convert cell to string and escape special characters
          let cellText = String(cell || "");

          // If the cell contains commas, quotes, or newlines, wrap it in quotes
          if (
            cellText.includes('"') ||
            cellText.includes(",") ||
            cellText.includes("\n")
          ) {
            // Double any existing quotes
            cellText = cellText.replace(/"/g, '""');
            // Wrap in quotes
            cellText = `"${cellText}"`;
          }

          return cellText;
        })
        .join(",");

      // Add row to CSV content
      csvContent += csvRow + "\n";
    }

    return csvContent;
  } catch (e) {
    Logger.log("Error generating CSV: " + e.toString());
    throw "Failed to generate CSV: " + e.message;
  }
}

/**
 * Direct entry point for scheduled runs
 * Extracts data for the last week
 */
function runWeeklyExtraction() {
  // Get default dates (last week to today)
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Format dates for input
  const todayFormatted = formatDateForInput(today);
  const lastWeekFormatted = formatDateForInput(lastWeek);

  // Get the first available space
  const spaces = getChatSpaces();
  if (spaces && spaces.length > 0) {
    extractChats(spaces[0].id, lastWeekFormatted, todayFormatted);
  } else {
    Logger.log("No spaces available for automatic extraction");
  }
}

/**
 * Convert date to RFC 3339 format required for the Chat API filter
 * @param {Date} date - Date object to format
 * @return {string} RFC 3339 formatted date string
 */
function toRFC3339(date) {
  return date.toISOString();
}

/**
 * Extract the sender's display name from a message object using People API
 * @param {Object} message - The message object from Chat API
 * @return {string} The sender's display name or a default if not found
 */
function getSenderDisplayName(message) {
  // Return default if no message or sender
  if (!message || !message.sender) {
    return "Unknown Sender";
  }

  // If display name is already available, return it
  if (message.sender.displayName) {
    return message.sender.displayName;
  }

  // Extract user ID from the sender name (format: "users/[USER_ID]")
  if (message.sender.name) {
    try {
      // Extract user ID properly
      const userIdMatch = message.sender.name.match(/^users\/(.+)$/);
      if (!userIdMatch) {
        return "Unknown Sender";
      }

      const userId = userIdMatch[1];

      // First try with People API
      try {
        const peopleResponse = People.People.get("people/" + userId, {
          personFields: "names",
        });

        if (
          peopleResponse &&
          peopleResponse.names &&
          peopleResponse.names.length > 0
        ) {
          return peopleResponse.names[0].displayName || "Unknown Sender";
        }
      } catch (peopleError) {
        Logger.log(`People API error: ${peopleError}`);
        // Continue to next approach
      }

      // Try with Directory API if People API fails
      try {
        // If the ID is numeric, try to look up by ID
        if (/^\d+$/.test(userId)) {
          const directoryUser = AdminDirectory.Users.get(userId);
          if (directoryUser && directoryUser.name) {
            return `${
              directoryUser.name.fullName ||
              directoryUser.name.givenName ||
              "Unknown"
            } (${directoryUser.primaryEmail})`;
          }
        }

        // If not found by ID, try by email
        // This assumes userId might be an email in some cases
        if (userId.includes("@")) {
          const directoryUser = AdminDirectory.Users.get(userId);
          if (directoryUser && directoryUser.name) {
            return `${
              directoryUser.name.fullName ||
              directoryUser.name.givenName ||
              "Unknown"
            } (${directoryUser.primaryEmail})`;
          }
        }
      } catch (directoryError) {
        Logger.log(`Directory API error: ${directoryError}`);
        // Continue to fallbacks
      }
    } catch (e) {
      Logger.log(`Error getting user details: ${e}`);
      // Continue to fallbacks
    }
  }

  // Final fallbacks
  return (
    message.sender.displayName ||
    (message.sender.name
      ? message.sender.name.split("/").pop()
      : "Unknown Sender")
  );
}

/**
 * Main function to extract chats from Google Chat
 * @param {string} spaceId - ID of the space to extract messages from
 * @param {string} startDateStr - Start date for custom range (YYYY-MM-DD)
 * @param {string} endDateStr - End date for custom range (YYYY-MM-DD)
 * @param {string} sessionId - Unique session identifier for concurrent users
 * @return {Object|string} Result object with message and sheetName, or error message
 */
function extractChats(
  spaceId = "spaces/AAAAgNDGhQk",
  startDateStr = "2025-04-20",
  endDateStr = "2025-04-26",
  sessionId = "default"
) {
  // Initialize progress status
  updateExtractionStatus("Initializing extraction...", sessionId);

  // Parse the dates
  let startDate = new Date(startDateStr);
  let endDate = new Date(endDateStr);

  // Set end date to include the full day
  endDate.setHours(23, 59, 59, 999);

  // Convert dates to RFC 3339 format for API filter
  const startTimeRFC = toRFC3339(startDate);
  const endTimeRFC = toRFC3339(endDate);

  updateExtractionStatus("Retrieving space information...", sessionId);

  // Get space name for the sheet title
  let spaceName = spaceId.split("/").pop(); // Default to ID if we can't get the name

  try {
    const space = Chat.Spaces.get(spaceId);
    if (space && space.displayName) {
      spaceName = space.displayName;
    }
  } catch (e) {
    Logger.log("Error getting space details: " + e.toString());
  }

  // Create a safe name for the sheet (remove invalid characters)
  const safeSpaceName = spaceName.replace(/[\\\/\$\*\?:]/g, "-");

  // Create a sheet name with date range and session ID to prevent conflicts
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();
  const sessionSuffix =
    sessionId !== "default" ? ` (${sessionId.substring(0, 8)})` : "";
  const sheetName = `${safeSpaceName} - ${formattedStartDate} to ${formattedEndDate}${sessionSuffix}`;
  const safeSheetName = sheetName.substring(0, 100); // Sheets have a 100 character limit

  updateExtractionStatus("Creating new spreadsheet...", sessionId);

  // Create a new sheet for the extracted data
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet;
  try {
    // Try to get existing sheet
    sheet = ss.getSheetByName(safeSheetName);
    if (sheet) {
      // If sheet exists, delete it
      ss.deleteSheet(sheet);
    }
    // Create new sheet
    sheet = ss.insertSheet(safeSheetName);

    // Store the current sheet name in properties with session ID
    PropertiesService.getScriptProperties().setProperty(
      `LAST_EXTRACTED_SHEET_${sessionId}`,
      safeSheetName
    );
  } catch (e) {
    Logger.log("Error with sheet creation: " + e.toString());
    sheet = ss.insertSheet(safeSheetName);
    PropertiesService.getScriptProperties().setProperty(
      `LAST_EXTRACTED_SHEET_${sessionId}`,
      safeSheetName
    );
  }

  // Set up headers
  sheet.appendRow([
    "Space Name",
    "Thread ID",
    "Sender Name",
    "Message Text",
    "Message Time",
    "Message URL",
    "Message Type", // Thread starter or reply
    "In Time Range", // Whether the message is within the selected time range
  ]);

  const headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setFontWeight("bold").setBackground("#f1f3f4");

  let messagesFound = 0;
  let threadStartersAdded = 0;

  // Data structures to track our processing
  const messagesInTimeRange = []; // Messages within our date range
  const threadsWithMessagesInRange = new Set(); // Threads that have at least one message in range
  const threadStarters = {}; // Map of threadId -> thread starter message
  const processedMessageIds = new Set(); // To avoid duplicates
  const allMessagesToAdd = []; // Final list of messages to add to sheet

  try {
    updateExtractionStatus("Fetching messages from Google Chat...", sessionId);

    // First, get messages within our time range using a filter if possible
    const filter = `createTime > "${startTimeRFC}" AND createTime < "${endTimeRFC}"`;
    Logger.log(`Using filter: ${filter}`);

    let useFiltering = true;
    let messages = [];
    let nextPageToken = null;

    try {
      // Try getting messages with filter
      const response = Chat.Spaces.Messages.list(spaceId, {
        pageSize: 100,
        filter: filter,
      });

      messages = response.messages || [];
      nextPageToken = response.nextPageToken;
      Logger.log(`Found ${messages.length} messages using API filter`);
      updateExtractionStatus(
        `Found ${messages.length} messages. Processing initial batch...`,
        sessionId
      );
    } catch (filterError) {
      // If filter fails, fall back to manual filtering
      Logger.log("Filter-based request failed: " + filterError);
      useFiltering = false;

      updateExtractionStatus(
        "API filter not supported. Retrieving all messages...",
        sessionId
      );

      const response = Chat.Spaces.Messages.list(spaceId, {
        pageSize: 100,
      });

      messages = response.messages || [];
      nextPageToken = response.nextPageToken;

      // Filter messages by date range manually
      if (!useFiltering) {
        messages = messages.filter((msg) => {
          if (!msg.createTime) return false;
          const msgDate = new Date(msg.createTime);
          return msgDate > startDate && msgDate < endDate;
        });
      }

      Logger.log(`Found ${messages.length} messages after manual filtering`);
      updateExtractionStatus(
        `Found ${messages.length} messages in time range. Processing...`,
        sessionId
      );
    }

    updateExtractionStatus(
      "Processing messages to identify threads...",
      sessionId
    );

    // Process the initial batch of messages to identify threads with messages in our range
    for (const message of messages) {
      // Skip messages without creation time
      if (!message.createTime) continue;

      // Add to our list of in-range messages
      messagesInTimeRange.push(message);

      // If this message belongs to a thread, track the thread
      if (message.thread && message.thread.name) {
        threadsWithMessagesInRange.add(message.thread.name);
      }
    }

    // Get additional pages of messages if available
    let pageCount = 1;

    while (nextPageToken) {
      try {
        updateExtractionStatus(
          `Processing page ${pageCount + 1} of messages...`,
          sessionId
        );

        let nextPageResponse;

        if (useFiltering) {
          try {
            nextPageResponse = Chat.Spaces.Messages.list(spaceId, {
              pageSize: 100,
              pageToken: nextPageToken,
              filter: filter,
            });
          } catch (e) {
            useFiltering = false;
            nextPageResponse = Chat.Spaces.Messages.list(spaceId, {
              pageSize: 100,
              pageToken: nextPageToken,
            });
          }
        } else {
          nextPageResponse = Chat.Spaces.Messages.list(spaceId, {
            pageSize: 100,
            pageToken: nextPageToken,
          });
        }

        let nextPageMessages = nextPageResponse.messages || [];
        nextPageToken = nextPageResponse.nextPageToken;

        // Filter manually if needed
        if (!useFiltering) {
          nextPageMessages = nextPageMessages.filter((msg) => {
            if (!msg.createTime) return false;
            const msgDate = new Date(msg.createTime);
            return msgDate > startDate && msgDate < endDate;
          });
        }

        // Process messages in this page
        for (const message of nextPageMessages) {
          if (!message.createTime) continue;

          messagesInTimeRange.push(message);

          if (message.thread && message.thread.name) {
            threadsWithMessagesInRange.add(message.thread.name);
          }
        }

        pageCount++;
      } catch (e) {
        Logger.log(`Error getting additional messages: ${e}`);
        break;
      }
    }

    Logger.log(
      `Identified ${threadsWithMessagesInRange.size} threads with messages in time range`
    );
    updateExtractionStatus(
      `Identified ${threadsWithMessagesInRange.size} threads. Finding thread starters...`,
      sessionId
    );

    // Now get the actual thread starters for each thread with messages in our range
    let threadCount = 0;
    const totalThreads = threadsWithMessagesInRange.size;

    for (const threadId of threadsWithMessagesInRange) {
      threadCount++;

      if (threadCount % 5 === 0 || threadCount === totalThreads) {
        updateExtractionStatus(
          `Processing thread starters: ${threadCount}/${totalThreads}`,
          sessionId
        );
      }

      try {
        Logger.log(`Looking for thread starter for thread: ${threadId}`);

        // Get messages for this thread, ordered by creation time (oldest first)
        const threadMessages = Chat.Spaces.Messages.get(threadId, {
          pageSize: 1, // We only need the first message
          orderBy: "createTime asc",
        });

        if (
          threadMessages &&
          threadMessages.messages &&
          threadMessages.messages.length > 0
        ) {
          // The first message is the thread starter
          const threadStarter = threadMessages.messages[0];
          threadStarters[threadId] = threadStarter;

          // Check if this thread starter is outside our time range
          const starterDate = new Date(threadStarter.createTime);
          const starterInRange =
            starterDate > startDate && starterDate < endDate;

          if (!starterInRange) {
            threadStartersAdded++;
            Logger.log(
              `Found thread starter outside time range for thread ${threadId}`
            );
          }
        } else {
          Logger.log(`No messages found directly from thread ${threadId}`);

          // Use alternate approach - find all messages from this thread in the space
          const filter = `thread.name = "${threadId}"`;

          try {
            const alternateResponse = Chat.Spaces.Messages.list(spaceId, {
              pageSize: 100,
              filter: filter,
            });

            if (
              alternateResponse &&
              alternateResponse.messages &&
              alternateResponse.messages.length > 0
            ) {
              // Sort messages by creation time to find the oldest
              const sortedMessages = alternateResponse.messages.sort((a, b) => {
                return (
                  new Date(a.createTime).getTime() -
                  new Date(b.createTime).getTime()
                );
              });

              threadStarters[threadId] = sortedMessages[0];

              // Check if this thread starter is outside our time range
              const starterDate = new Date(sortedMessages[0].createTime);
              const starterInRange =
                starterDate > startDate && starterDate < endDate;

              if (!starterInRange) {
                threadStartersAdded++;
                Logger.log(
                  `Found thread starter (alternate method) outside time range for thread ${threadId}`
                );
              }
            }
          } catch (e) {
            Logger.log(`Error with alternate thread starter approach: ${e}`);
          }
        }
      } catch (e) {
        Logger.log(`Error getting thread starter for ${threadId}: ${e}`);

        // If we couldn't get the thread starter, try a fallback method
        // Look through the messages we already have and find the oldest for this thread
        const messagesInThread = messagesInTimeRange.filter(
          (msg) => msg.thread && msg.thread.name === threadId
        );

        if (messagesInThread.length > 0) {
          // Sort by creation time
          messagesInThread.sort((a, b) => {
            return (
              new Date(a.createTime).getTime() -
              new Date(b.createTime).getTime()
            );
          });

          // Use the oldest message as the thread starter
          threadStarters[threadId] = messagesInThread[0];
          Logger.log(
            `Using oldest available message as thread starter for ${threadId} (fallback method)`
          );
        }
      }
    }

    updateExtractionStatus("Organizing messages by thread...", sessionId);

    // Process all messages in time range and add thread starters
    for (const threadId of threadsWithMessagesInRange) {
      // First add the thread starter if we found one
      if (threadStarters[threadId]) {
        const threadStarter = threadStarters[threadId];

        // Check if the starter is within our time range
        const starterDate = new Date(threadStarter.createTime);
        const starterInRange = starterDate > startDate && starterDate < endDate;

        // Add the thread starter to our messages to process
        allMessagesToAdd.push({
          message: threadStarter,
          inRange: starterInRange,
          isThreadStarter: true,
        });

        processedMessageIds.add(threadStarter.name);
      }
    }

    // Add all other messages in time range that aren't thread starters
    for (const message of messagesInTimeRange) {
      // Skip if we already processed this message (like if it was a thread starter)
      if (processedMessageIds.has(message.name)) continue;

      const messageThread = message.thread ? message.thread.name : null;
      const isThreadStarter =
        messageThread &&
        threadStarters[messageThread] &&
        threadStarters[messageThread].name === message.name;

      allMessagesToAdd.push({
        message: message,
        inRange: true,
        isThreadStarter: isThreadStarter,
      });

      processedMessageIds.add(message.name);
    }

    updateExtractionStatus("Sorting messages by thread and time...", sessionId);

    // Sort messages: first by thread, then by time within thread
    allMessagesToAdd.sort((a, b) => {
      // Get thread IDs (or empty string if no thread)
      const threadA = a.message.thread ? a.message.thread.name : "";
      const threadB = b.message.thread ? b.message.thread.name : "";

      // First sort by thread
      if (threadA !== threadB) {
        return threadA.localeCompare(threadB);
      }

      // Within a thread, sort by time
      return (
        new Date(a.message.createTime).getTime() -
        new Date(b.message.createTime).getTime()
      );
    });

    updateExtractionStatus(
      `Formatting and writing ${allMessagesToAdd.length} messages to spreadsheet...`,
      sessionId
    );

    // Now add all messages to the sheet
    let processedCount = 0;
    const totalMessages = allMessagesToAdd.length;

    for (const item of allMessagesToAdd) {
      const message = item.message;
      messagesFound++;
      processedCount++;

      // Update status periodically to avoid too many updates
      if (processedCount % 20 === 0 || processedCount === totalMessages) {
        updateExtractionStatus(
          `Writing messages to spreadsheet: ${processedCount}/${totalMessages}`,
          sessionId
        );
      }

      // Extract sender's full name using our improved function
      const sender = getSenderDisplayName(message);

      // Extract message text, handling different formats
      let messageText = "[No text content]";
      if (message.text) {
        messageText = message.text;
      } else if (message.formattedText) {
        messageText = message.formattedText;
      } else if (message.content) {
        messageText = JSON.stringify(message.content);
      }

      // Format message timestamp
      let messageDate = new Date(message.createTime);
      let messageDateFormatted = messageDate.toLocaleString();

      // Extract thread information
      let threadId = "N/A";
      if (message.thread && message.thread.name) {
        threadId = message.thread.name.split("/").pop();
      }

      // Create message URL
      const spaceIdShort = spaceId.split("/").pop();
      const messageUrl = `https://chat.google.com/room/${spaceIdShort}/${threadId}`;

      // Determine message type (thread starter or reply)
      let messageType = "Unknown";

      if (item.isThreadStarter) {
        messageType = "Thread Starter";
      } else if (message.thread && message.thread.name) {
        messageType = "Reply";
      } else {
        messageType = "Direct Message";
      }

      // Note whether the message is in our time range
      const inTimeRangeText = item.inRange ? "Yes" : "No - Thread Starter";

      // Add row to sheet
      sheet.appendRow([
        spaceName,
        threadId,
        sender,
        messageText,
        messageDateFormatted,
        messageUrl,
        messageType,
        inTimeRangeText,
      ]);
    }
  } catch (e) {
    const errorMsg = "Error accessing Chat API: " + e.toString();
    Logger.log(errorMsg);
    updateExtractionStatus("Error: " + errorMsg, sessionId);
    return { message: errorMsg };
  }

  updateExtractionStatus("Finalizing spreadsheet formatting...", sessionId);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 8);

  // Create rich hyperlinks for message URLs
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const urlRange = sheet.getRange(2, 6, lastRow - 1, 1);
    const urlValues = urlRange.getValues();
    const urlFormulas = [];

    for (const row of urlValues) {
      const url = row[0];
      if (url && url.startsWith("http")) {
        urlFormulas.push(['=HYPERLINK("' + url + '", "Open Message")']);
      } else {
        urlFormulas.push([url]); // Preserve original if not a URL
      }
    }

    urlRange.setFormulas(urlFormulas);
  }

  // Add conditional formatting to highlight different message types
  if (lastRow > 1) {
    // Formatting for message types
    const messageTypeRange = sheet.getRange(2, 7, lastRow - 1, 1);

    // Thread starter formatting (green background)
    const threadStarterRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Thread Starter")
      .setBackground("#e6f4ea") // Light green
      .setBold(true)
      .setRanges([messageTypeRange])
      .build();

    // Reply formatting (light gray background)
    const replyRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Reply")
      .setBackground("#f1f3f4") // Light gray
      .setRanges([messageTypeRange])
      .build();

    // Formatting for time range indicator
    const timeRangeRange = sheet.getRange(2, 8, lastRow - 1, 1);

    // Out-of-range messages formatting (light red)
    const outOfRangeRule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("No")
      .setBackground("#fce8e6") // Light red
      .setFontColor("#ea4335") // Darker red
      .setRanges([timeRangeRange])
      .build();

    // Apply all formatting rules
    const rules = sheet.getConditionalFormatRules();
    rules.push(threadStarterRule);
    rules.push(replyRule);
    rules.push(outOfRangeRule);
    sheet.setConditionalFormatRules(rules);
  }

  // Freeze the header row
  sheet.setFrozenRows(1);

  // Final status update
  updateExtractionStatus("Extraction complete!", sessionId);

  // Log completion message
  const resultMsg = `${messagesFound} messages extracted to sheet "${safeSheetName}"`;
  // TODO(james): (including ${threadStartersAdded} thread starters from outside the selected date range)
  Logger.log("Chat extraction complete. " + resultMsg);

  // Return both the message and the sheet name so we can reference it later for CSV export
  return {
    message: resultMsg,
    sheetName: safeSheetName,
  };
}
