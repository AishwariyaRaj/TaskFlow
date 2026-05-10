// RBAC middleware: checks user's role within the workspace and required roles
module.exports = function requireRole(roles = []){
  return (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspace || req.query.workspace;
    if (!workspaceId) return res.status(400).json({ message: 'workspaceId required' });
    const membership = (req.user.memberships || []).find(m => String(m.workspace) === String(workspaceId));
    if (!membership) return res.status(403).json({ message: 'Not a member of this workspace' });
    if (roles.length === 0 || roles.includes(membership.role)) return next();
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};
