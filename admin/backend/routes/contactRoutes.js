const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/contactController');

router.post('/', createMessage);
router.get('/', protect, getMessages);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
