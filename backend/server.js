/* Simple Express server for Acronymle backend
   - GET /api/solutions  -> returns list of solutions from data/db.json
   - GET /api/health     -> simple health check
   - In production, if frontend build exists, it will serve static files.
*/

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Load local data file
const dataPath = path.join(__dirname, 'data', 'db.json');
let db = { solutions: [] };
try {
  db = require(dataPath);
} catch (err) {
  console.warn('Could not load db.json, starting with empty data.');
}

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/solutions', (req, res) => {
  res.json(db.solutions || []);
});

// Check a guess against the current solution
// Expects JSON body: { guess: 'xxxxx' }
// Returns: { correct: true/false }
app.post('/api/check', (req, res) => {
  const guess = (req.body && req.body.guess || '').toLowerCase();
  const solution = (db.solutions && db.solutions[0] && db.solutions[0].word) || '';
  const correct = guess === solution;
  res.json({ correct });
});

// Serve frontend build if present
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  // If a static index exists, serve it, otherwise return 404 for unknown API routes
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(frontendBuildPath, 'index.html'), err => {
    if (err) res.status(404).send('Not found');
  });
});

app.listen(port, () => {
  console.log(`Acronymle backend listening on port ${port}`);
});