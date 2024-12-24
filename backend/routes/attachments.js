import express from 'express';
import path from 'path';
import Attachment from '../models/Attachment.js';
import fs from 'fs';

const router = express.Router();

// Скачивание файла по его ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.resolve(attachment.filePath);

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'File cannot be downloaded' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
