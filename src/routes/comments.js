const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const ctrl = require('../controllers/commentController');

router.get('/:taskId/comments', requireAuth, ctrl.getTaskComments);
router.post('/:taskId/comments', requireAuth, ctrl.addComment);
router.delete('/comments/:commentId', requireAuth, ctrl.deleteComment);

module.exports = router;
