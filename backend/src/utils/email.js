const nodemailer = require('nodemailer');

let testAccount = null;
let testTransporter = null;

async function createTransporter(){
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: user ? { user, pass } : undefined
    });
  }
  
  console.warn('SMTP not configured; falling back to Ethereal Email for testing');
  
  if (testTransporter) return testTransporter;
  
  try {
    if (!testAccount) {
      testAccount = await nodemailer.createTestAccount();
    }
    testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return testTransporter;
  } catch (err) {
    console.error('Failed to create Ethereal test account', err);
    return null;
  }
}

async function sendMail({ to, subject, text, html }){
  const transporter = await createTransporter();
  if (!transporter) return;
  
  try {
    const info = await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_FROM || 'no-reply@example.com'}>`,
      to,
      subject,
      text,
      html
    });
    
    // Log preview URL if using ethereal email
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log('Preview Email URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (err) {
    console.error('Email send failed:', err);
    throw err;
  }
}

async function sendVerificationEmail(user, token){
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontend.split(',')[0].replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;
  const subject = 'Verify your email';
  const text = `Hi ${user.name},\n\nPlease verify your email by visiting: ${verifyUrl}\n\nIf you didn't request this, ignore.`;
  const html = `<p>Hi ${user.name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`;
  try{
    await sendMail({ to: user.email, subject, text, html });
  } catch(err){
    console.error('Failed to send verification email', err);
    console.log(`\n==================================================`);
    console.log(`[EMAIL FALLBACK] Verification link for user ${user.email}:`);
    console.log(verifyUrl);
    console.log(`==================================================\n`);
  }
}

module.exports = { sendMail, sendVerificationEmail };
