const cors = require('cors');
const express = require('express');
const app = express();
require('./db');
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const companyRoutes = require('./routes/company.routes');
app.use('/companies', companyRoutes);

const employeeRoutes = require('./routes/employee.routes');
app.use('/employee', employeeRoutes);

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

module.exports = app;                                                                                                                                                                                                                         