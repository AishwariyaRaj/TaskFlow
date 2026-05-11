const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Todo','In Progress','Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  dueDate: Date,
  attachments: [{
    url: String,
    name: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
