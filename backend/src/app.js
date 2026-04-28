const cors = require('cors');
const express = require('express');
const app = express();
require('./db');
app.use(express.json());
app.use(cors());
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

module.exports = app;                                                                                                                                                                                                                         