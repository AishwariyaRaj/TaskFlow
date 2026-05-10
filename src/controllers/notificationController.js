const Notification = require('../models/Notification');

async function listNotifications(req, res){
  try{
    const { workspaceId } = req.params;
    const notifications = await Notification.find({ workspace: workspaceId, user: req.user._id }).sort('-createdAt').limit(100);
    res.json(notifications);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function markAsRead(req, res){
  try{
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function markAllRead(req, res){
  try{
    const { workspaceId } = req.params;
    await Notification.updateMany(
      { workspace: workspaceId, user: req.user._id, readAt: { $exists: false } },
      { readAt: new Date() }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listNotifications, markAsRead, markAllRead };
