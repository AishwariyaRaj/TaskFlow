const Rule = require('../models/Rule');
const Task = require('../models/Task');
const { createWorkspaceNotification } = require('../services/notificationService');

/**
 * Executes automations based on a trigger and context
 * @param {string} trigger - The event that triggered the automation (e.g. 'task.completed')
 * @param {object} context - Data related to the trigger (e.g. { task, workspaceId, userId, updates })
 */
async function executeAutomations(trigger, context) {
  const { workspaceId, task, userId, updates } = context;

  try {
    const rules = await Rule.find({ workspace: workspaceId, trigger, isActive: true });
    if (!rules.length) return;

    for (const rule of rules) {
      if (checkConditions(rule.conditions, task, updates)) {
        await runActions(rule.actions, context);
      }
    }
  } catch (err) {
    console.error('Automation execution error:', err);
  }
}

function checkConditions(conditions, task, updates) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every(cond => {
    const currentValue = task[cond.field];
    
    switch (cond.operator) {
      case 'equals':
        return String(currentValue) === String(cond.value);
      case 'not_equals':
        return String(currentValue) !== String(cond.value);
      case 'contains':
        return String(currentValue).includes(cond.value);
      default:
        return false;
    }
  });
}

async function runActions(actions, context) {
  const { workspaceId, task, userId } = context;

  for (const action of actions) {
    switch (action.type) {
      case 'notify_owner':
        await createWorkspaceNotification({
          workspaceId,
          userIds: [String(task.createdBy)],
          type: 'automation_notice',
          title: 'Automation Triggered',
          message: `Automation rule updated task: ${task.title}`,
          entityType: 'Task',
          entityId: task._id
        });
        break;

      case 'update_status':
        await Task.findByIdAndUpdate(task._id, { status: action.value });
        break;

      case 'assign_user':
        await Task.findByIdAndUpdate(task._id, { $addToSet: { assignees: action.value } });
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }
  }
}

module.exports = { executeAutomations };
