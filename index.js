require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Url = require('./models/Url');

const app = express();

const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Database Connected Successfully, bro!'))
  .catch((err) => console.log('Uh oh, database error:', err));


app.get('/', (req, res) => {
  res.send('My Server is Running, bro!');
});


app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  try {
    if (!originalUrl) {
      return res.status(400).json({ message: "Bro, you need to provide a URL!" });
    }

    let existingUrl = await Url.findOne({ originalUrl: originalUrl });
    

    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    if (existingUrl) {
      return res.json({
        message: "Already shortened!",
        shortUrl: `${BASE_URL}/${existingUrl.shortId}`
      });
    }

    const shortId = Math.random().toString(36).substring(2, 8);
    
    const newUrl = new Url({
      originalUrl: originalUrl,
      shortId: shortId
    });

    await newUrl.save();

    res.json({
      message: "Short URL created successfully",
      shortUrl: `${BASE_URL}/${shortId}`
    });
    
  } catch (error) {
    console.log("Database Crash Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/:shortId', async (req, res) => {
  try {
    const urlData = await Url.findOne({ shortId: req.params.shortId });
    
    if (urlData) {
      return res.redirect(urlData.originalUrl);
    } else {
      return res.status(404).json("URL not found, bro!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});