const Message = require('../models/Message');
const { sendContactNotification } = require('../config/mailer');

// POST /api/contact — public, called by the portfolio's contact form
const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are all required' });
    }

    const saved = await Message.create({ name, email, message });

    // Save the message first so a submission is never lost even if the
    // notification email fails (e.g. SMTP hiccup). We just log it.
    try {
      await sendContactNotification({ name, email, message });
      saved.emailNotificationSent = true;
      await saved.save();
    } catch (mailErr) {
      console.error('Failed to send contact notification email:', mailErr.message);
    }

    res.status(201).json({ message: 'Message received' });
  } catch (err) {
    console.error('createMessage error:', err.message);
    res.status(500).json({ message: 'Server error while saving your message' });
  }
};

// GET /api/contact — protected, powers the admin panel list
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// PATCH /api/contact/:id/read — protected, toggle read state
const markAsRead = async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Message not found' });
    res.json(updated);
  } catch (err) {
    console.error('markAsRead error:', err.message);
    res.status(500).json({ message: 'Server error while updating message' });
  }
};

// DELETE /api/contact/:id — protected
const deleteMessage = async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error:', err.message);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};

module.exports = { createMessage, getMessages, markAsRead, deleteMessage };
