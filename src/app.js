const express = require('express');
const config = require('./config');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.env} mode`);
});

module.exports = app;
