const express = require('express');

const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/auth', authRoutes);
app.use(errorHandler);

module.exports = app;
