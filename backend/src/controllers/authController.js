const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const jwtUtils = require('../utils/jwt');
const { sendVerificationEmail, sendMail } = require('../utils/email');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function register(req, res){
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const isEmailVerified = !process.env.SMTP_HOST;
  const emailVerificationToken = isEmailVerified ? undefined : uuidv4();
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, emailVerificationToken, isEmailVerified });
  try{
    await sendVerificationEmail(user, emailVerificationToken);
  } catch(err){
    console.error('sendVerificationEmail error', err);
  }
  res.status(201).json({ message: 'User created. Please check your email to verify your account.' });
}

async function verifyEmail(req, res){
  const token = req.body.token || req.query.token;
  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
}

async function resendVerification(req, res){
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
  user.emailVerificationToken = uuidv4();
  await user.save();
  try{ await sendVerificationEmail(user, user.emailVerificationToken); } catch(err){ console.error(err); }
  res.json({ message: 'Verification email sent' });
}

async function login(req, res){
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  if (!user.isEmailVerified) return res.status(403).json({ message: 'Please verify your email before logging in' });
  const accessToken = jwtUtils.signAccess({ sub: user._id }, process.env.JWT_ACCESS_SECRET);
  const refreshToken = jwtUtils.signRefresh({ sub: user._id }, process.env.JWT_REFRESH_SECRET);
  user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save();
  const cookieOpts = { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30*24*60*60*1000 };
  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
  res.cookie('refreshToken', refreshToken, cookieOpts);
  res.json({ accessToken, user: { _id: user._id, name: user.name, email: user.email } });
}

async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Credential required' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create user if not exists
      user = await User.create({
        name,
        email: email.toLowerCase(),
        isEmailVerified: true, // Google emails are already verified
        googleId,
        avatar: picture
      });
    } else {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    }

    const accessToken = jwtUtils.signAccess({ sub: user._id }, process.env.JWT_ACCESS_SECRET);
    const refreshToken = jwtUtils.signRefresh({ sub: user._id }, process.env.JWT_REFRESH_SECRET);
    
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
    await user.save();

    const cookieOpts = { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30*24*60*60*1000 };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('refreshToken', refreshToken, cookieOpts);

    res.json({ accessToken, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Google login error', err);
    res.status(400).json({ message: 'Google authentication failed' });
  }
}

async function refresh(req, res){
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try{
    const payload = jwtUtils.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const found = user.refreshTokens.find(r => r.token === token);
    // refresh token reuse detection: valid token but not found in DB
    if (!found){
      // possible theft - clear all refresh tokens
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ message: 'Refresh token reuse detected. Please re-authenticate.' });
    }
    // rotate: remove the used token, issue a new one
    user.refreshTokens = user.refreshTokens.filter(r => r.token !== token);
    const newRefresh = jwtUtils.signRefresh({ sub: user._id }, process.env.JWT_REFRESH_SECRET);
    user.refreshTokens.push({ token: newRefresh, createdAt: new Date() });
    await user.save();
    const newAccess = jwtUtils.signAccess({ sub: user._id }, process.env.JWT_ACCESS_SECRET);
    const cookieOpts = { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30*24*60*60*1000 };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('refreshToken', newRefresh, cookieOpts);
    res.json({ accessToken: newAccess, user: { _id: user._id, name: user.name, email: user.email } });
  } catch(err){
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

async function logout(req, res){
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token && req.user){
    req.user.refreshTokens = (req.user.refreshTokens || []).filter(r => r.token !== token);
    await req.user.save();
  }
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out successfully' });
}

async function forgotPassword(req, res){
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });
  // Always respond with success to prevent email enumeration
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontend}/reset-password?token=${encodeURIComponent(resetToken)}`;
    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your password',
        text: `Hi ${user.name},\n\nClick this link to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
        html: `<p>Hi ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`
      });
    } catch(emailErr) {
      console.error('Failed to send password reset email', emailErr);
    }
  }
  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

async function resetPassword(req, res){
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'token and password required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Invalidate all refresh tokens for security
  user.refreshTokens = [];
  await user.save();
  res.json({ message: 'Password reset successfully. Please log in with your new password.' });
}

async function getMe(req, res){
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, isEmailVerified: req.user.isEmailVerified, memberships: req.user.memberships, createdAt: req.user.createdAt });
}

async function updateMe(req, res){
  try {
    const { name } = req.body;
    if (name) req.user.name = name;
    await req.user.save();
    res.json({ _id: req.user._id, name: req.user.name, email: req.user.email });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, verifyEmail, resendVerification, login, refresh, logout, forgotPassword, resetPassword, getMe, updateMe, googleLogin };
