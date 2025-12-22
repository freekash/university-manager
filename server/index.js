require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // Import admin routes
const facultyRoutes = require('./src/routes/facultyRoutes'); // Import faculty routes

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes); // Use admin routes
app.use('/api/faculty', facultyRoutes); // Use faculty routes

// Error handling middleware
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

app.get('/', (req, res) => res.send('University API is Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
