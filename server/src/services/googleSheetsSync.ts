import { google } from 'googleapis';
import Task, { ITaskDocument } from '../models/Task';
import Category from '../models/Category';
import dotenv from 'dotenv';
import { ITask } from '../types';

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

const CATEGORY_COLUMNS = ['Task Title', 'Description', 'Priority', 'Status', 'Start Date', 'Due Date', 'Completed Date', 'Task ID', 'Last Updated'];
const TOTAL_SCHEDULE_NAME = '📅 Total Schedule';

/**
 * Ensures a sheet (tab) exists and has correct headers.
 */
async function ensureSheetExists(title: string, headers: string[]) {
  if (!SPREADSHEET_ID) return;
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  let sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === title);

  if (!sheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }]
      }
    });
  }

  // Check headers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A1:Z1`,
  });

  if (!response.data.values || response.data.values[0].length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] }
    });
  }
  
  return true;
}

/**
 * Hides a sheet (Archive)
 */
export async function archiveSheet(title: string) {
  if (!SPREADSHEET_ID) return;
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === title);
  
  if (sheet && sheet.properties?.sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: { sheetId: sheet.properties.sheetId, hidden: true },
            fields: 'hidden'
          }
        }]
      }
    });
  }
}

/**
 * Pushes all app data to Sheets
 */
export async function pushToSheets() {
  if (!SPREADSHEET_ID) return;

  const categories = await Category.find({ isArchived: { $ne: true } });
  const allTasks: ITaskDocument[] = [];

  for (const category of categories) {
    await ensureSheetExists(category.name, CATEGORY_COLUMNS);
    const tasks = await Task.find({ category: category.name });
    allTasks.push(...tasks);

    const rows = tasks.map(t => [
      t.title,
      t.description || '',
      t.priority,
      t.status,
      t.startDate ? t.startDate.toISOString() : '',
      t.dueDate ? t.dueDate.toISOString() : '',
      t.completedDate ? t.completedDate.toISOString() : '',
      t._id.toString(),
      t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString()
    ]);

    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `${category.name}!A2:Z1000` });
    if (rows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${category.name}!A2`,
        valueInputOption: 'RAW',
        requestBody: { values: rows }
      });
    }
  }

  await updateOverviewTab(allTasks);
}

/**
 * Updates the 'Total Schedule' tab with visual cues
 */
async function updateOverviewTab(tasks: ITaskDocument[]) {
  if (!SPREADSHEET_ID) return;
  const headers = ['Date', 'Task Title', 'Category', 'Priority', 'Status', 'Due Date', 'Duration Bar'];
  await ensureSheetExists(TOTAL_SCHEDULE_NAME, headers);

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const rows = sortedTasks.map(t => {
    const now = new Date();
    const dueDate = new Date(t.dueDate);
    let statusMarker = '⚪';
    if (t.status === 'completed') statusMarker = '✅ GREEN';
    else if (dueDate < now) statusMarker = '🚨 RED (OVERDUE)';
    else statusMarker = '⏳ YELLOW (UPCOMING)';

    const duration = t.startDate ? `${new Date(t.startDate).toLocaleDateString()} ~ ${dueDate.toLocaleDateString()}` : dueDate.toLocaleDateString();

    return [
      dueDate.toLocaleDateString(),
      t.title,
      t.category,
      t.priority,
      statusMarker,
      t.dueDate.toISOString(),
      duration
    ];
  });

  await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `${TOTAL_SCHEDULE_NAME}!A2:Z1000` });
  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TOTAL_SCHEDULE_NAME}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
  }
}

/**
 * Pulls changes from Sheets to MongoDB (LWW logic)
 */
export async function pullFromSheets() {
  if (!SPREADSHEET_ID) return;

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetTitles = spreadsheet.data.sheets?.map(s => s.properties?.title).filter(t => t && t !== TOTAL_SCHEDULE_NAME) || [];

  for (const title of sheetTitles) {
    if (!title) continue;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A2:I`,
    });

    const rows = response.data.values || [];
    for (const row of rows) {
      const [taskTitle, description, priority, status, startDate, dueDate, completedDate, taskId, lastUpdated] = row;
      
      const sheetUpdateDate = lastUpdated ? new Date(lastUpdated) : new Date(0);
      
      const taskData: any = {
        title: taskTitle,
        description,
        category: title,
        priority: (priority || 'medium').toLowerCase(),
        status: (status || 'pending').toLowerCase(),
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        completedDate: completedDate ? new Date(completedDate) : undefined,
      };

      if (taskId && taskId.match(/^[0-9a-fA-F]{24}$/)) {
        const existingTask = await Task.findById(taskId);
        if (existingTask) {
          // LWW Logic: Only update if Sheet is newer than DB
          if (sheetUpdateDate > new Date(existingTask.updatedAt || 0)) {
            await Task.findByIdAndUpdate(taskId, taskData);
          }
        } else {
          await Task.create({ ...taskData, _id: taskId });
        }
      } else {
        // New task from sheet
        await Task.create(taskData);
      }
    }
  }
}

let syncStatus = {
  lastSync: new Date(0),
  status: 'idle'
};

export function getSyncStatus() {
  return syncStatus;
}

export async function startPolling() {
  console.log('Starting Google Sheets polling (30s)...');
  setInterval(async () => {
    try {
      syncStatus.status = 'syncing';
      await pullFromSheets();
      syncStatus.lastSync = new Date();
      syncStatus.status = 'success';
    } catch (e) {
      console.error('Polling sync failed:', e);
      syncStatus.status = 'error';
    }
  }, 30000);
}
