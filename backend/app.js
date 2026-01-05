const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hostname: os.hostname() });
});

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

module.exports = app;
