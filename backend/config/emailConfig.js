const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',  // Using 'gmail' service instead of manual host/port
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false  // Helps bypass some connection issues
    },
    timeout: 10000  // Set timeout to 10 seconds
});

// Test the connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

module.exports = transporter;