const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String },
  entityType: { type: String },
  entityId: { type: Schema.Types.ObjectId },
  readAt: { type: Date },
  data: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
