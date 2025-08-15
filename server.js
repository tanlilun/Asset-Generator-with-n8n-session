// server.js - Express implementation of the n8nui pattern
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// n8n configuration
const Hosted_URL = process.env.Hosted_URL || 'http://localhost:3000';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://rapidlab.app.n8n.cloud/webhook-test';

// Middleware
app.use(express.json());
app.use(express.static('public'));
const cors = require('cors');
app.use(cors());

// Log API calls
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// View routes
// Start page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/start.html'));
});

// Submit Page
app.post('/submit', async (req, res) => {
  try {
    const payload = req.body;

    // Send data to your n8n webhook (GET or POST depending on your flow)
    const webhookRes = await fetch(`${N8N_WEBHOOK_URL}/new-ui-1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!webhookRes.ok) {
      console.error('Webhook failed:', await webhookRes.text());
      return res.status(500).send('Webhook call failed');
    }

    // On success, redirect or respond
    res.status(200).send('OK'); // frontend will handle redirect
  } catch (err) {
    console.error('Error in /submit:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Add this line at the top if needed
app.use(express.urlencoded({ extended: true }));

function createInMemoryApi(entityName, routeBase, dataArray) {
  // POST
  app.post(routeBase, (req, res) => {
    const data = req.body;
    dataArray.push(data);
    console.log(`📥 Received ${entityName}:`, data);
    res.redirect(`/api/${entityName}`);
  });

  // GET
  app.get(`/api/${entityName}`, (req, res) => {
    res.json(dataArray);
  });

  // DELETE
  app.delete(`/api/${entityName}`, (req, res) => {
    dataArray.length = 0;
    console.log(`🗑️ Cleared ${entityName} data.`);
    res.status(200).json({ message: `${entityName} data cleared.` });
  });
}

createInMemoryApi('captions', '/captions', captionData = []);
createInMemoryApi('images', '/images', imageData = []);
// createInMemoryApi('preview-fb', '/preview-fb', previewFbData = []);
// createInMemoryApi('preview-ig', '/preview-ig', previewIgData = []);
// createInMemoryApi('preview-linkedIn', '/preview-linkedIn', previewLinkedInData = []);
createInMemoryApi('email-items', '/email-items', emailData = []);
createInMemoryApi('videos', '/videos', videoData = []);
createInMemoryApi('leader-board-1', '/leader-board-1', leaderBoard1Data = []);
createInMemoryApi('leader-board-2', '/leader-board-2', leaderBoard2Data = []);
createInMemoryApi('leader-board-3', '/leader-board-3', leaderBoard3Data = []);
createInMemoryApi('bill-board-1', '/bill-board-1', billBoard1Data = []);
createInMemoryApi('bill-board-2', '/bill-board-2', billBoard2Data = []);
createInMemoryApi('bill-board-3', '/bill-board-3', billBoard3Data = []);
createInMemoryApi('half-page-1', '/half-page-1', halfPage1Data = []);
createInMemoryApi('half-page-2', '/half-page-2', halfPage2Data = []);
createInMemoryApi('half-page-3', '/half-page-3', halfPage3Data = []);

app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`- Open ${Hosted_URL} in your browser`);
  console.log(`- n8n Webhook URL: ${N8N_WEBHOOK_URL}`);
});