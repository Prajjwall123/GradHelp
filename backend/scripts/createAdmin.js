require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const connectDB = require('../config/db');

const ADMIN_EMAIL = 'admin@gradhelp.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'Admin User';

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        const admin = new User({
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Password:', ADMIN_PASSWORD);
        console.log('IMPORTANT: Change this password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
