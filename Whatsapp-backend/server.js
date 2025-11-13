const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

let history = [];
let templates = [];

// Send Message Endpoint
app.post('/send', (req, res) => {
  const { to, message } = req.body;
  const entry = {
    _id: Date.now() + Math.random() + "",
    to,
    message,
    sentAt: new Date().toLocaleString(),
    status: 'SENT', // simulate always successful
  };
  history.unshift(entry); // newest first
  res.json({ success: true });
});

// Get History
app.get('/history', (req, res) => {
  res.json(history);
});

// Save Template
app.post('/template', (req, res) => {
  const { name, content } = req.body;
  const existing = templates.find(t => t.name === name);
  if (existing) {
    existing.content = content;
  } else {
    templates.push({
      _id: Date.now() + Math.random() + "",
      name,
      content,
    });
  }
  res.json({ success: true });
});

// Get Templates
app.get('/templates', (req, res) => {
  res.json(templates);
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
