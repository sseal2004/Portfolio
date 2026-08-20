require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express();

// CLIENT_ORIGIN is a comma-separated list, e.g.
//   CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
// so the portfolio site and the admin panel can both talk to this
// same backend without CORS blocking one or the other.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/contact', contactRoutes);
app.use('/api/admin', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Central error handler — catches anything thrown outside a route's
// own try/catch instead of crashing the process.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));