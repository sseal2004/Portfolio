import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Message from '../models/Message.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const isEmailMatch = email === process.env.ADMIN_EMAIL;
  const isPasswordMatch = isEmailMatch
    ? await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)
    : false;

  if (!isEmailMatch || !isPasswordMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.get('/messages', requireAdmin, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.patch('/messages/:id/read', requireAdmin, async (req, res) => {
  const updated = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!updated) return res.status(404).json({ error: 'Message not found.' });
  res.json(updated);
});

router.delete('/messages/:id', requireAdmin, async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Message not found.' });
  res.json({ success: true });
});

export default router;