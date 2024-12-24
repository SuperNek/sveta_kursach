import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Получить всех пользователей
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать нового пользователя
router.post('/', async (req, res) => {
  const { name, role, email } = req.body;
  if (!name || !role || !email) {
    return res.status(400).json({ error: 'Name, role, and email are required' });
  }
  try {
    const user = await User.create({ name, role, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
