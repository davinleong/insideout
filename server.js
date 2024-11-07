// server.js
//function to set light color based on emotion

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
//const messages = require('./lang/en'); 
const messages = require('./lang/message.json');

const app = express();
const PORT = process.env.PORT || 3000;
const GOVEE_API_KEY = process.env.GOVEE_API_KEY;
const GOVEE_DEVICE_MODEL = process.env.GOVEE_DEVICE_MODEL;
const GOVEE_DEVICE_ID = process.env.GOVEE_DEVICE_ID;

app.use(express.json());
app.use('/lang', express.static('lang'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Initial emotion-to-color mapping
let emotionColors = {
  angry: { r: 255, g: 0, b: 0 },       // Red
  happy: { r: 0, g: 255, b: 0 },       // Green
  sad: { r: 0, g: 0, b: 255 },         // Blue
  fear: { r: 128, g: 0, b: 128 },      // Purple
  disgust: { r: 139, g: 69, b: 19 },   // Brown
  neutral: { r: 128, g: 128, b: 128 }, // Gray
  surprise: { r: 255, g: 255, b: 0 }   // Yellow
};

// Endpoint to fetch devices from Govee API
app.get('/api/devices', async (req, res) => {
  try {
    const response = await axios.get(
      'https://openapi.api.govee.com/router/api/v1/user/devices', {
      headers: {
        'Content-Type': 'application/json',
        'Govee-API-Key': GOVEE_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching devices:", error.message);
    res.status(500).json({ message: messages.errors.deviceFetchFailed });
  }
});

// Set light color based on emotion
app.post('/api/set-emotion', async (req, res) => {
  const { emotion } = req.body;

  if (!emotion || !emotionColors[emotion]) {
    return res.status(400).json({ message: messages.errors.invalidEmotion });
  }

  const color = emotionColors[emotion];
  try {
    const response = await axios.put(
      'https://developer-api.govee.com/v1/devices/control',
      {
        device: GOVEE_DEVICE_ID,
        model: GOVEE_DEVICE_MODEL,
        cmd: { name: 'color', value: color }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Govee-API-Key': GOVEE_API_KEY,
        }
      }
    );
    res.json({ message: `${messages.success.colorSet} ${emotion}`, data: response.data });
  } catch (error) {
    console.error("Error setting light color:", error.message);
    res.status(500).json({ message: messages.errors.lightControlFailed });
  }
});

// Get current emotion-color mappings
app.get('/api/emotions', (req, res) => {
  res.json(emotionColors);
});

// Update a specific emotion color
app.put('/api/emotions/:emotion', (req, res) => {
  const { emotion } = req.params;
  const { r, g, b } = req.body;

  if (!emotionColors[emotion]) {
    return res.status(400).json({ message: messages.errors.invalidEmotion });
  }

  if ([r, g, b].some(value => value < 0 || value > 255)) {
    return res.status(400).json({ message: messages.errors.invalidColorValue });
  }

  emotionColors[emotion] = { r, g, b };
  res.json({ message: `${messages.success.colorUpdated} ${emotion}`, data: emotionColors[emotion] });
});

// Delete an emotion color mapping
app.delete('/api/emotions/:emotion', (req, res) => {
  const { emotion } = req.params;

  if (!emotionColors[emotion]) {
    return res.status(400).json({ message: messages.errors.invalidEmotion });
  }

  delete emotionColors[emotion];
  res.json({ message: `${messages.success.colorDeleted} ${emotion}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});