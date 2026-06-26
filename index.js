require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const Url = require('./models/Url');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const BASE_URL =
  process.env.BASE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${PORT}`;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    message: 'Too many URLs created. Please try again later.',
  },
});

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is missing from environment variables!');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.status(200).send('URL Shortener API is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.post('/shorten', shortenLimiter, async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ message: 'Please provide a URL' });
  }

  try {
    const parsedUrl = new URL(originalUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: 'Only http:// and https:// URLs are allowed',
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: 'Invalid URL. Include http:// or https://',
    });
  }

  try {
    const existingUrl = await Url.findOne({ originalUrl });

    if (existingUrl) {
      return res.status(200).json({
        message: 'Already shortened',
        shortUrl: `${BASE_URL}/${existingUrl.shortId}`,
      });
    }

    let shortId;
    let duplicate;

    do {
      shortId = crypto.randomBytes(4).toString('hex');
      duplicate = await Url.findOne({ shortId });
    } while (duplicate);

    const newUrl = new Url({
      originalUrl,
      shortId,
    });

    await newUrl.save();

    return res.status(201).json({
      message: 'Short URL created successfully',
      shortUrl: `${BASE_URL}/${shortId}`,
    });
  } catch (error) {
    console.error('Shorten error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/:shortId', async (req, res) => {
  try {
    const urlData = await Url.findOneAndUpdate(
      { shortId: req.params.shortId },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!urlData) {
      return res.status(404).json({ message: 'URL not found' });
    }

    return res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});
