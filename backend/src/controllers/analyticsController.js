const mongoose = require('mongoose');
const Activity = require('../models/ActivityLog');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

function toObjectId(id){
  return new mongoose.Types.ObjectId(String(id));
}

function formatDateKey(date){
  return date.toISOString().slice(0, 10);
}

async function getWorkspaceAnalytics(req, res){
  try{
    const { workspaceId } = req.params;
    const workspaceObjectId = toObjectId(workspaceId);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const [totalTasks, completedTasks, todoTasks, inProgressTasks, activeUsersResult, activities, recentActivity] = await Promise.all([
      Task.countDocuments({ workspace: workspaceObjectId }),
      Task.countDocuments({ workspace: workspaceObjectId, status: 'Done' }),
      Task.countDocuments({ workspace: workspaceObjectId, status: 'Todo' }),
      Task.countDocuments({ workspace: workspaceObjectId, status: 'In Progress' }),
      Activity.aggregate([
        { $match: { workspace: workspaceObjectId, createdAt: { $gte: start } } },
        { $group: { _id: '$user' } },
        { $count: 'count' }
      ]),
      Activity.find({ workspace: workspaceObjectId, createdAt: { $gte: start } }).sort('createdAt').lean(),
      Activity.find({ workspace: workspaceObjectId }).populate('user', 'name email').sort('-createdAt').limit(20).lean()
    ]);

    const activeUsers = activeUsersResult?.[0]?.count || 0;
    const byDay = new Map();
    // Use local time offset for formatting dates to fix the timezone bug
    const offset = new Date().getTimezoneOffset() * 60000;
    for (let i = 0; i < 7; i += 1){
      const d = new Date(start.getTime() - offset);
      d.setDate(start.getDate() + i);
      byDay.set(formatDateKey(d), { date: formatDateKey(d), created: 0, completed: 0, activity: 0 });
    }

    activities.forEach(item => {
      const localDate = new Date(new Date(item.createdAt).getTime() - offset);
      const key = formatDateKey(localDate);
      if (!byDay.has(key)) return;
      const bucket = byDay.get(key);
      bucket.activity += 1;
      if (item.action === 'task.created') bucket.created += 1;
      const wasCompleted = item.action === 'task.updated' && item.meta && item.meta.updates && item.meta.updates.status === 'Done';
      if (wasCompleted) bucket.completed += 1;
    });

    const productivityTrend = Array.from(byDay.values());
    
    const taskDistribution = [
      { name: 'Todo', value: todoTasks, color: '#f59e0b' },
      { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
      { name: 'Done', value: completedTasks, color: '#10b981' }
    ];

    res.json({
      totalTasks,
      completedTasks,
      activeUsers,
      productivityTrend,
      taskDistribution,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      recentActivityCount: recentActivity.length
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getWorkspaceActivity(req, res){
  try{
    const { workspaceId } = req.params;
    const limit = Math.min(Number(req.query.limit || 30), 100);
    const items = await Activity.find({ workspace: workspaceId })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit)
      .lean();
    res.json(items);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function exportWorkspaceData(req, res){
  try {
    const { workspaceId } = req.params;
    const { format } = req.query; // 'csv' or 'pdf'

    const [tasks, activities, projects] = await Promise.all([
      Task.find({ workspace: workspaceId }).populate('assignees', 'name').lean(),
      Activity.find({ workspace: workspaceId }).populate('user', 'name').sort('-createdAt').lean(),
      Project.find({ workspace: workspaceId }).lean()
    ]);

    if (format === 'csv') {
      const fields = ['title', 'status', 'priority', 'project', 'createdAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(tasks);
      res.header('Content-Type', 'text/csv');
      res.attachment(`workspace-export-${workspaceId}.csv`);
      return res.send(csv);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.header('Content-Type', 'application/pdf');
      res.attachment(`workspace-export-${workspaceId}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Workspace Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(16).text('Projects');
      projects.forEach(p => doc.fontSize(12).text(`- ${p.name}: ${p.description || 'No description'}`));
      doc.moveDown();

      doc.fontSize(16).text('Tasks Summary');
      doc.fontSize(12).text(`Total Tasks: ${tasks.length}`);
      doc.text(`Completed: ${tasks.filter(t => t.status === 'Done').length}`);
      doc.moveDown();

      doc.fontSize(16).text('Recent Activity');
      activities.slice(0, 20).forEach(a => {
        const date = new Date(a.createdAt).toLocaleDateString();
        doc.fontSize(10).text(`[${date}] ${a.user?.name || 'System'}: ${a.action}`);
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format. Use csv or pdf.' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getWorkspaceAnalytics, getWorkspaceActivity, exportWorkspaceData };
