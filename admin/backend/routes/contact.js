import express from 'express';
import rateLimit from 'express-rate-limit';
import Message from '../models/Message.js';
import { sendContactNotification } from '../config/mailer.js';

const router = express.Router();

// Basic spam guard: 5 submissions per IP per 15 minutes.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
});

router.post('/', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const saved = await Message.create({ name, email, message });

    try {
      await sendContactNotification({ name, email, message });
    } catch (mailErr) {
      // The message is already saved and will show up in the admin panel —
      // don't fail the whole request just because the email didn't send.
      console.error('Email notification failed:', mailErr.message);
    }

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error('Failed to save message:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;