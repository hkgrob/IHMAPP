
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { DECLARATION_CATEGORIES } from '@/constants/DeclarationsData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  const category = DECLARATION_CATEGORIES.find(cat => cat.id === id);
  
  if (!category) {
    return res.status(404).json({ error: 'PDF not found' });
  }
  
  const filePath = path.join(process.cwd(), 'attached_assets', category.source);
  
  try {
    const fileContent = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${category.source}"`);
    return res.send(fileContent);
  } catch (error) {
    console.error('Error serving PDF:', error);
    return res.status(500).json({ error: 'Error serving PDF file' });
  }
}
