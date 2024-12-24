import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Request from '../models/Request.js';
import Attachment from '../models/Attachment.js';

const router = express.Router();

// Настройка Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Фильтрация по типу файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Only .jpg, .png, and .pdf files are allowed!'));
  } else {
    cb(null, true);
  }
};

// Создаём Multer middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение размера файла: 10MB
  fileFilter,
});

// Получить все заявки
router.get('/', async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [{ model: Attachment, as: 'attachments' }],
    });

    res.json(requests || []);
  } catch (error) {
    console.error('Ошибка API /api/requests:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Создать новую заявку с вложениями
router.post('/', upload.single('attachment'), async (req, res) => {
  const { description, priority, initiator, executor, dueDate, comments } = req.body;

  if (!description || !priority || !initiator) {
    return res.status(400).json({ error: 'Description, priority, and initiator are required' });
  }

  try {
    // Создаём заявку
    const request = await Request.create({
      description,
      priority,
      initiator,
      executor,
      dueDate,
      comments,
    });

    // Сохраняем файл как вложение
    if (req.file) {
      await Attachment.create({
        requestId: request.id,
        filePath: req.file.path,
      });
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Удалить заявку
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const attachments = await Attachment.findAll({ where: { requestId: id } });
    for (const attachment of attachments) {
      const filePath = path.resolve(attachment.filePath);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Error deleting file: ${filePath}`, err);
      }
      await attachment.destroy();
    }

    await request.destroy();

    res.json({ message: 'Request and associated attachments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Редактировать заявку
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, status, priority, executor, dueDate, comments } = req.body;

  try {
    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await request.update({
      description,
      status,
      priority,
      executor,
      dueDate,
      comments,
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заявку по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findByPk(id, {
      include: [{ model: Attachment, as: 'attachments' }],
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;