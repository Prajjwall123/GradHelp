const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const connectDB = require("./config/db");
const { generalLimiter, authLimiter, formSubmitLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const { csrfProtection, verifyCSRFToken } = require('./middleware/csrfProtection');

const app = express();

const universityRoutes = require("./routes/universityRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const applicationDecisionRoutes = require('./routes/applicationDecisionRoutes');
const scholarshipDecisionRoutes = require('./routes/scholarshipDecisionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const scholarshipApplicationRoutes = require('./routes/scholarshipApplicationRoutes');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const logRoutes = require('./routes/logRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Connect to database
connectDB();

const corsOptions = {
    origin: ["https://localhost:5173", "https://192.168.58.1:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"]
};

app.use(generalLimiter);
app.use(cors(corsOptions));
// Log all requests
app.use(requestLogger);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add CSRF protection middleware
app.use(csrfProtection);

app.use('/api/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiters for specific routes
app.use("/api/users/login", authLimiter);
app.use("/api/contact", formSubmitLimiter);
app.use("/api/applications", formSubmitLimiter);
app.use("/api/scholarship-applications", formSubmitLimiter);

// Apply auth limiter to all auth routes
authRoutes.use(authLimiter);

// Routes
app.use("/api/universities", universityRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/application-decisions", applicationDecisionRoutes);
app.use("/api/scholarship-decisions", scholarshipDecisionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/scholarship-applications", scholarshipApplicationRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
    rejectUnauthorized: false
};

// Creating HTTPS server
const PORT = process.env.PORT;
const httpsServer = https.createServer(sslOptions, app);

// Starting the server
httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${PORT}`);
    console.log(`API available at https://localhost:${PORT}/api`);
});

module.exports = { app, httpsServer };


