const multer = require('multer');
const { uploadBuffer, deleteFile } = require('../services/uploadService');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');
const { createWorkspaceNotification } = require('../services/notificationService');

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for video support
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|mp4|webm|quicktime|video\/mp4|video\/webm|application\/pdf|msword|wordprocessingml|excel|spreadsheetml|text\/plain|zip|application\/x-zip-compressed|application\/zip/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extension = allowedTypes.test(file.originalname.toLowerCase());
    
    if (mimetype || extension) {
      return cb(null, true);
    }
    cb(new Error('File type not supported. Please upload images, videos, PDFs, or standard documents.'));
  }
});

async function uploadTaskAttachment(req, res){
  try{
    const { workspaceId, projectId, taskId } = req.params;
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId, project: projectId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!req.file) return res.status(400).json({ message: 'File required' });

    const result = await uploadBuffer(req.file.buffer, { folder: `workspaces/${workspaceId}/tasks/${taskId}` });
    
    const attachment = {
      url: result.secure_url,
      name: req.file.originalname,
      publicId: result.public_id,
      uploadedAt: new Date()
    };

    task.attachments = task.attachments || [];
    task.attachments.push(attachment);
    await task.save();

    await logActivity(workspaceId, req.user._id, 'task.attachment.uploaded', {
      taskId: task._id,
      attachmentUrl: result.secure_url,
      originalName: req.file.originalname
    });

    const notifyUserIds = [...new Set((task.assignees || []).map(String).concat(String(task.createdBy || '')))].filter(Boolean);
    if (notifyUserIds.length){
      await createWorkspaceNotification({
        workspaceId,
        userIds: notifyUserIds,
        type: 'task_attachment_uploaded',
        title: `Attachment added to ${task.title}`,
        message: `${req.user.name || 'A user'} uploaded ${req.file.originalname}`,
        entityType: 'Task',
        entityId: task._id,
        data: { url: result.secure_url, originalName: req.file.originalname }
      });
    }

    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('task.attachment.uploaded', { taskId: task._id, attachmentUrl: result.secure_url });

    res.status(201).json({ url: result.secure_url, attachment, task });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
}

async function deleteTaskAttachment(req, res){
  try{
    const { workspaceId, projectId, taskId, attachmentId } = req.params;
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId, project: projectId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const attachmentIndex = task.attachments.findIndex(a => String(a._id) === attachmentId);
    if (attachmentIndex === -1) return res.status(404).json({ message: 'Attachment not found' });

    const attachment = task.attachments[attachmentIndex];
    
    // Delete from Cloudinary
    if (attachment.publicId) {
      await deleteFile(attachment.publicId);
    }

    // Remove from task
    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    await logActivity(workspaceId, req.user._id, 'task.attachment.deleted', {
      taskId: task._id,
      attachmentName: attachment.name
    });

    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('task.attachment.deleted', { taskId: task._id, attachmentId });

    res.json({ message: 'Attachment deleted', task });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
}

module.exports = { upload, uploadTaskAttachment, deleteTaskAttachment };
