const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembershipSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  role: { type: String, enum: ['Owner','Admin','Member'], default: 'Member' }
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: false },
  googleId: { type: String },
  avatar: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailNotificationsEnabled: { type: Boolean, default: true },
  refreshTokens: [{ token: String, createdAt: Date }],
  memberships: [MembershipSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
