const Rule = require('../models/Rule');

async function listRules(req, res) {
  try {
    const { workspaceId } = req.params;
    const rules = await Rule.find({ workspace: workspaceId }).sort('-createdAt');
    res.json(rules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createRule(req, res) {
  try {
    const { workspaceId } = req.params;
    const { name, trigger, conditions, actions } = req.body;

    const rule = await Rule.create({
      workspace: workspaceId,
      name,
      trigger,
      conditions,
      actions,
      createdBy: req.user._id
    });

    res.status(201).json(rule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateRule(req, res) {
  try {
    const { workspaceId, ruleId } = req.params;
    const rule = await Rule.findOneAndUpdate(
      { _id: ruleId, workspace: workspaceId },
      req.body,
      { new: true }
    );
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteRule(req, res) {
  try {
    const { workspaceId, ruleId } = req.params;
    const rule = await Rule.findOneAndDelete({ _id: ruleId, workspace: workspaceId });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listRules, createRule, updateRule, deleteRule };
