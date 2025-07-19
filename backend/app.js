const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require('path');
const { generalLimiter, authLimiter, formSubmitLimiter } = require('./middleware/rateLimiter');
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
const notificationRoutes = require('./routes/notificationRoutes');
const fileRoutes = require('./routes/fileRoutes');

connectDB();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};

// rate limiting to all routes
app.use(generalLimiter);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with rate limiting
app.use('/api/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//specific rate limiters to routes
app.use("/api/auth", authLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/contact", formSubmitLimiter);
app.use("/api/applications", formSubmitLimiter);
app.use("/api/scholarship-applications", formSubmitLimiter);

// Routes
app.use("/api/universities", universityRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/application-decisions", applicationDecisionRoutes);
app.use("/api/scholarship-decisions", scholarshipDecisionRoutes);
app.use("/api/files", fileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/scholarship-applications', scholarshipApplicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
