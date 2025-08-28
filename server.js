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
  res.sendFile(path.join(__dirname, 'public/views/form.html'));
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function createInMemoryApi(entityName, routeBase, dataArray) {
  // POST
  app.post(routeBase, (req, res) => {
    const data = {
      ...req.body,
      _sessionId: req.body.sessionId,
      _createdAt: Date.now()
    };

    dataArray.push(data);
    console.log(`📥 Received ${entityName} from session ${data._sessionId}:`, data);

    // Set timeout to delete after 1 hour
    setTimeout(() => {
      const index = dataArray.indexOf(data);
      if (index !== -1) {
        dataArray.splice(index, 1);
        console.log(`⏳ Deleted ${entityName} for session ${data._sessionId} after 1 hour`);
      }
    }, 60 * 60 * 1000); // 1 hour

    res.status(200).json({ message: `${entityName} saved for session ${data._sessionId}` });
  });

  // GET (by sessionId query param)
  app.get(`/api/${entityName}`, (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId query parameter.' });
    }

    const filteredData = dataArray.filter(item => item._sessionId === sessionId);
    res.json(filteredData);
  });
}


createInMemoryApi('captions', '/captions', []);
createInMemoryApi('images', '/images', []);
// createInMemoryApi('preview-fb', '/preview-fb', []);
// createInMemoryApi('preview-ig', '/preview-ig', []);
// createInMemoryApi('preview-linkedIn', '/preview-linkedIn', []);
createInMemoryApi('email-items', '/email-items', []);
createInMemoryApi('canva-titles', '/canva-titles', []);
createInMemoryApi('videos', '/videos', []);
createInMemoryApi('leader-board-1', '/leader-board-1', []);
createInMemoryApi('leader-board-2', '/leader-board-2', []);
createInMemoryApi('leader-board-3', '/leader-board-3', []);
createInMemoryApi('bill-board-1', '/bill-board-1', []);
createInMemoryApi('bill-board-2', '/bill-board-2', []);
createInMemoryApi('bill-board-3', '/bill-board-3', []);
createInMemoryApi('half-page-1', '/half-page-1', []);
createInMemoryApi('half-page-2', '/half-page-2', []);
createInMemoryApi('half-page-3', '/half-page-3', []);


app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// Start the server
app.listen(PORT, () => {
  console.log(`- Open ${Hosted_URL} in your browser`);
  console.log(`- n8n Webhook URL: ${N8N_WEBHOOK_URL}`);
});