import { google } from 'googleapis';
import Task from '../models/Task';
import Category from '../models/Category';
import dotenv from 'dotenv';

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

export const syncToSheets = async () => {
  if (!SPREADSHEET_ID) return;

  const categories = await Category.find().sort({ order: 1 });
  
  for (const category of categories) {
    const tasks = await Task.find({ category: category.name });
    
    // Check if sheet exists, if not create it
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetExists = spreadsheet.data.sheets?.some(s => s.properties?.title === category.name);
    
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: category.name } } }]
        }
      });
    }

    // Update sheet content
    const rows = tasks.map(t => [
      t._id.toString(),
      t.title,
      t.description || '',
      t.priority,
      t.status,
      t.startDate ? t.startDate.toISOString() : '',
      t.dueDate ? t.dueDate.toISOString() : '',
      t.completedDate ? t.completedDate.toISOString() : ''
    ]);

    // Clear and update
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${category.name}!A1:Z1000`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${category.name}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ID', 'Title', 'Description', 'Priority', 'Status', 'Start Date', 'Due Date', 'Completed Date'], ...rows]
      },
    });
  }
};

export const syncFromSheets = async () => {
  if (!SPREADSHEET_ID) return;

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetTitles = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];

  for (const title of sheetTitles) {
    if (!title) continue;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A2:H`,
    });

    const rows = response.data.values || [];
    
    for (const row of rows) {
      const [id, titleVal, description, priority, status, startDate, dueDate, completedDate] = row;
      
      const taskData = {
        title: titleVal,
        description,
        category: title,
        priority,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        completedDate: completedDate ? new Date(completedDate) : undefined,
      };

      if (id && id !== '') {
        await Task.findByIdAndUpdate(id, taskData, { upsert: true });
      } else {
        await Task.create(taskData);
      }
    }
  }
};
