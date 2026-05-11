const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivitySchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  meta: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
