import { Request, Response } from 'express';
import { pushToSheets, pullFromSheets, getSyncStatus } from '../services/googleSheetsSync';

export const forcePush = async (req: Request, res: Response) => {
  try {
    await pushToSheets();
    res.json({ message: 'Force push to Google Sheets successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forcePull = async (req: Request, res: Response) => {
  try {
    await pullFromSheets();
    res.json({ message: 'Force pull from Google Sheets successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchSyncStatus = (req: Request, res: Response) => {
  res.json(getSyncStatus());
};
