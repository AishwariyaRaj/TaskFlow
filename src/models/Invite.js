const mongoose = require('mongoose');
const { Schema } = mongoose;

const InviteSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  email: { type: String, required: true, lowercase: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  token: { type: String, required: true, unique: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accepted: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invite', InviteSchema);
