const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { requirePlan } = require('../middlewares/plan');
const { upload, uploadTaskAttachment, deleteTaskAttachment } = require('../controllers/uploadController');

router.post('/:projectId/tasks/:taskId/attachment', requireAuth, requireRole(['Owner','Admin','Member']), requirePlan('PRO'), upload.single('file'), uploadTaskAttachment);
router.delete('/:projectId/tasks/:taskId/attachment/:attachmentId', requireAuth, requireRole(['Owner','Admin','Member']), deleteTaskAttachment);

module.exports = router;
