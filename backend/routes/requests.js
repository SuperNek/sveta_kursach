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
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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
    limits: { fileSize: 5 * 1024 * 1024 }, // Ограничение размера файла: 5MB
    fileFilter,
  });

// Получить все заявки
router.get('/', async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [{ model: Attachment, as: 'attachments' }],
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую заявку с вложениями
router.post('/', upload.array('attachments', 10), async (req, res) => {
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

    // Сохраняем вложения
    if (req.files) {
      const attachments = req.files.map((file) => ({
        requestId: request.id,
        filePath: file.path,
      }));
      await Attachment.bulkCreate(attachments);
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Находим заявку по ID
    const request = await Request.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Удаляем связанные вложения из базы данных
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
    

    // Удаляем заявку
    await request.destroy();

    res.json({ message: 'Request and associated attachments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Редактирование заявки
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, status, priority, executor, dueDate, comments } = req.body;

  try {
    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Обновляем заявку
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

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findByPk(id, {
      include: [
        { model: Attachment, as: 'attachments' }, // Если есть вложения
      ],
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
