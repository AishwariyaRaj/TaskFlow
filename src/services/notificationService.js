const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendMail } = require('../utils/email');

async function createNotification({ workspaceId, userId, type, title, message = '', entityType = null, entityId = null, data = {} }){
  const notification = await Notification.create({
    workspace: workspaceId,
    user: userId,
    type,
    title,
    message,
    entityType,
    entityId,
    data
  });

  try{
    const io = global.__io;
    if (io) io.to(String(userId)).emit('notification.created', notification);
  } catch(err){
    console.error('socket notification emit failed', err);
  }

  try{
    const user = await User.findById(userId);
    if (user && user.emailNotificationsEnabled){
      await sendMail({
        to: user.email,
        subject: title,
        text: message || title,
        html: `<p>${message || title}</p>`
      });
    }
  } catch(err){
    console.error('email notification failed', err);
  }

  return notification;
}

async function createWorkspaceNotification({ workspaceId, userIds = [], type, title, message = '', entityType = null, entityId = null, data = {} }){
  const created = [];
  for (const userId of userIds){
    created.push(await createNotification({ workspaceId, userId, type, title, message, entityType, entityId, data }));
  }
  return created;
}

module.exports = { createNotification, createWorkspaceNotification };
