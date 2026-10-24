const express = require('express');
const config = require('./config');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

module.exports = app;