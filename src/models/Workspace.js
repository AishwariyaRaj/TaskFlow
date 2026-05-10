const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  plan: { type: String, enum: ['FREE', 'PRO', 'TEAM'], default: 'FREE' },
  billing: {
    stripeCustomerId: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
