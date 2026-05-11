const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, attachments } = req.body;

    const task = await Task.findById(taskId).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      task: taskId,
      user: req.user.id,
      content,
      attachments
    });

    const populatedComment = await comment.populate('user', 'name avatar');

    // Notify task assignee if it's not the commenter
    if (task.assignee && String(task.assignee) !== String(req.user.id)) {
      await Notification.create({
        user: task.assignee,
        workspace: task.workspace,
        type: 'mention',
        title: 'New Comment',
        message: `${req.user.name} commented on task: ${task.title}`,
        link: `/workspaces/${task.workspace}/projects/${task.project._id}?task=${task._id}`
      });
    }

    // Real-time update
    const io = global.__io || req.app.get('io');
    if (io) io.to(String(task.project._id)).emit('comment:added', populatedComment);

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (String(comment.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
