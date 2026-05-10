const Workspace = require('../models/Workspace');
const Subscription = require('../models/Subscription');
const { normalizePlan, resolvePlanFromPriceId } = require('../services/billingService');

const PLAN_ORDER = {
  FREE: 0,
  PRO: 1,
  TEAM: 2
};

function mapLegacyPlan(legacy) {
  if (!legacy) return null;
  const s = String(legacy).trim().toLowerCase();
  if (s === 'pro') return 'PRO';
  if (s === 'team') return 'TEAM';
  if (s === 'free') return 'FREE';
  return null;
}

async function loadWorkspace(req) {
  const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
  if (!workspaceId) return null;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return null;

  if (!workspace.plan) {
    const sub = await Subscription.findOne({ workspace: workspaceId });
    let resolved = resolvePlanFromPriceId(sub?.priceId) || mapLegacyPlan(workspace.billing?.plan);

    if (!resolved && sub?.stripeSubscriptionId && process.env.STRIPE_SECRET && !process.env.STRIPE_SECRET.startsWith('sk_live_')) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET);
        const remote = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        const remotePriceId = remote?.items?.data?.[0]?.price?.id;
        const remotePlan = resolvePlanFromPriceId(remotePriceId) || normalizePlan(remote?.metadata?.targetPlan);
        if (remotePriceId) sub.priceId = remotePriceId;
        if (remote?.status) sub.status = remote.status;
        if (remote?.current_period_end) sub.currentPeriodEnd = new Date(remote.current_period_end * 1000);
        await sub.save();
        resolved = remotePlan;
      } catch {
      }
    }

    workspace.plan = resolved || 'FREE';
    await workspace.save();
  }

  req.workspace = workspace;
  req.workspacePlan = workspace.plan || 'FREE';
  return workspace;
}

function requirePlan(minPlan) {
  const min = String(minPlan || 'FREE').toUpperCase();
  return async (req, res, next) => {
    try {
      const workspace = await loadWorkspace(req);
      if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

      const current = req.workspacePlan || 'FREE';
      if ((PLAN_ORDER[current] ?? 0) >= (PLAN_ORDER[min] ?? 0)) return next();
      return res.status(403).json({ message: `${min} plan required` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
}

module.exports = { requirePlan, loadWorkspace };
