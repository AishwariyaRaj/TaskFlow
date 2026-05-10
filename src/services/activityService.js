const Activity = require('../models/ActivityLog');

async function logActivity(workspace, user, action, meta = {}){
  try{
    const a = await Activity.create({ workspace, user, action, meta });
    return a;
  } catch(err){
    console.error('Failed to log activity', err);
  }
}

module.exports = { logActivity };
