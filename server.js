const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (your HTML, JS, etc.)
app.use(express.static(__dirname));

// Parse JSON bodies
app.use(express.json());

// Path to your map data file
const mapDataPath = path.join(__dirname, 'map', 'mapData.json');

// GET wall data
app.get('/map/wallData', (req, res) => {
  fs.readFile(mapDataPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading wall data');
    res.json(JSON.parse(data));
  });
});

// POST wall data
app.post('/map/wallData', (req, res) => {
  fs.writeFile(mapDataPath, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Error saving wall data');
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));