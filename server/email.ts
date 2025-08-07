import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email service configuration using Gmail's free SMTP
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Email verification disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass, // Use App Password for Gmail
    },
  });
};

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<boolean> => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email service not configured. Skipping email send.');
    return false;
  }

  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Loop Lab Course',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            background: #007bff; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Loop Lab Course</h1>
          </div>
          <div class="content">
            <h2>Welcome ${name}!</h2>
            <p>Thank you for signing up for Loop Lab Course. To complete your registration and gain access to our premium courses, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>Once verified, you'll have access to:</p>
            <ul>
              <li>Modern Software Development courses</li>
              <li>AI-assisted coding tutorials</li>
              <li>Automated testing workflows</li>
              <li>Premium learning materials</li>
            </ul>
            
            <p>If you didn't create this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Human in Loop AI Corp. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Loop Lab Course!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Loop Lab Course</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Loop Lab Course!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Congratulations! Your email has been verified and you now have full access to Loop Lab Course.</p>
            
            <p>You can now access all your enrolled courses and premium content:</p>
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}" class="button">Access Your Courses</a>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Explore your enrolled courses</li>
              <li>Join our community discussions</li>
              <li>Start with the Modern Software Development track</li>
              <li>Check out our AI-assisted coding tools</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy learning!</p>
            <p><strong>The Loop Lab Course Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Human in Loop AI Corp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};