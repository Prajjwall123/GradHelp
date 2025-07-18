const nodemailer = require('nodemailer');
const ContactMessage = require('../models/contactMessage');

// Create a transporter using the same configuration as in email.js
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendContactEmail = async (message) => {
    try {
        const mailOptions = {
            from: `"Gradly Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Sending to the same email as in .env
            subject: `New Contact Form: ${message.subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${message.name}</p>
                <p><strong>Email:</strong> ${message.email}</p>
                <p><strong>Subject:</strong> ${message.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p>This message was sent from the Gradly contact form.</p>
                <p>Received at: ${new Date().toLocaleString()}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending contact email:', error);
        return false;
    }
};

const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Create new message
        const newMessage = new ContactMessage({
            name,
            email,
            subject,
            message,
            ipAddress
        });

        // Save to database
        await newMessage.save();

        // Send email
        const emailSent = await sendContactEmail(newMessage);

        if (!emailSent) {
            console.error('Failed to send notification email for contact form submission');
            // Continue even if email fails, as the message is already saved in the database
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.'
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your message. Please try again later.'
        });
    }
};

const getContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact messages'
        });
    }
};

module.exports = {
    submitContactForm,
    getContactMessages
};
