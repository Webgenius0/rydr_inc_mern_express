/* eslint-disable no-console */
import nodemailer, { SentMessageInfo } from 'nodemailer';
import { NextFunction } from 'express';
import config from '../config';

export type TEmailHelperParams = {
  to: string | string[];
  subject: string;
  message?: string;
  html?: string;
  next?: NextFunction;
};

export const emailHelper = async ({
  to,
  subject,
  message,
  html,
  next,
}: TEmailHelperParams): Promise<SentMessageInfo | void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Fedicycle" <${config.email_from}>`,
      to,
      subject,
      text: message || '',
      html: html || '',
    };

    const result = await transporter.sendMail(mailOptions); 
    return result;
  } catch (err) {
    console.log(err);
    if (next) return next(err as Error);
  }
};
