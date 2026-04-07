dotenv.config();
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL as string,
    pass: process.env.SENDER_APP_PASS as string,
  },
});

export default transporter;
