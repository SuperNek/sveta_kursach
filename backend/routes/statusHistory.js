import express from 'express';
import StatusHistory from '../models/StatusHistory.js';

const router = express.Router();

// Получить историю статусов
router.get('/', async (req, res) => {
  try {
    const history = await StatusHistory.findAll();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить новую запись в историю статусов
router.post('/', async (req, res) => {
  const { requestId, status } = req.body;
  if (!requestId || !status) {
    return res.status(400).json({ error: 'RequestId and status are required' });
  }
  try {
    const record = await StatusHistory.create({ requestId, status });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
