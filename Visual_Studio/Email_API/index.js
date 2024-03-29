const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const otpStorage = {};
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Setup Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure:false,
    logger: true,
    debug: true,
    ignoreTLS:true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // API endpoint to send OTP to the user's email
  app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    // Generate OTP (you can use a library for this)
    const otp = Math.floor(1000 + Math.random() * 9000);
  
    try {
      // Send OTP to user's email
      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Verification Code',
        text: `Your OTP for email verification is: ${otp}`,
      };
      otpStorage[email] = otp;
      
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: otp });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });
  
  // In-memory storage for OTPs (you should use a database in a real app)


// API endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  // Verify OTP
  if (otpStorage[email] === otp) {
    // OTP matched, user verified
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    // OTP not matched, verification failed
    res.status(400).json({ error: 'Invalid OTP' });
  }
});
