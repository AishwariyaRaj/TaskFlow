const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  trigger: {
    type: String, // e.g., 'task.completed', 'task.created', 'task.priority_changed'
    required: true
  },
  conditions: [{
    field: String,   // e.g., 'priority', 'status'
    operator: String, // e.g., 'equals', 'not_equals', 'contains'
    value: mongoose.Schema.Types.Mixed
  }],
  actions: [{
    type: {
      type: String, // e.g., 'notify_owner', 'update_status', 'assign_user'
      required: true
    },
    value: mongoose.Schema.Types.Mixed
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
