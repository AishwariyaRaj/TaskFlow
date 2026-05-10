const billingService = require('../services/billingService');
const Workspace = require('../models/Workspace');
const Subscription = require('../models/Subscription');
const Stripe = require('stripe');

async function createCheckout(req, res){
  try{
    const { workspaceId } = req.params;
    const { priceId, plan } = req.body;
    
    console.log(`[BILLING-CHECKOUT] Creating checkout. workspaceId=${workspaceId}, plan=${plan}, priceId=${priceId}`);

    if (!process.env.STRIPE_SECRET) {
      return res.status(400).json({ message: 'Stripe is not configured. Set STRIPE_SECRET (sk_test_...) in backend .env.' });
    }
    if (process.env.STRIPE_SECRET.startsWith('sk_live_')) {
      return res.status(400).json({ message: 'Live Stripe keys are not allowed. Use Stripe Test Mode keys only.' });
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: 'Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET (whsec_...).' });
    }
    
    if (!priceId && !plan) return res.status(400).json({ message: 'priceId or plan required' });

    const normalizedPlan = billingService.normalizePlan(plan);
    let resolvedPriceId = priceId;
    if (!resolvedPriceId) {
      const targetPlan = normalizedPlan;
      if (!targetPlan) return res.status(400).json({ message: 'Invalid plan. Allowed: PRO, TEAM' });
      const planMap = {
        PRO: process.env.STRIPE_PRICE_PRO,
        TEAM: process.env.STRIPE_PRICE_TEAM
      };
      resolvedPriceId = planMap[targetPlan];
      if (!resolvedPriceId) {
        return res.status(500).json({ message: `Stripe price id not configured for ${targetPlan}. Set STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM.` });
      }
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    let frontendUrl = req.headers.origin;
    if (!frontendUrl) {
      frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0] : 'http://localhost:3000';
    }
    
    const successUrl = `${frontendUrl}/workspaces/${workspaceId}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/workspaces/${workspaceId}/billing?canceled=true`;
    
    console.log(`[BILLING-CHECKOUT] Calling billingService with resolvedPriceId: ${resolvedPriceId}`);
    
    const session = await billingService.createCheckoutSession({
      workspaceId,
      successUrl,
      cancelUrl,
      priceId: resolvedPriceId,
      email: req.user.email,
      plan: normalizedPlan || billingService.resolvePlanFromPriceId(resolvedPriceId)
    });
    
    console.log(`[BILLING-CHECKOUT] Success! Checkout URL created`);
    res.json({ url: session.url, id: session.id });
  } catch(err){
    console.error(`[BILLING-CHECKOUT] ERROR:`, err.message);
    console.error(err.stack);
    const status = /not configured|not set|invalid|allowed/i.test(err.message) ? 400 : 500;
    res.status(status).json({ message: err.message || 'Failed to create checkout session' });
  }
}

async function getSubscription(req, res){
  try{
    const { workspaceId } = req.params;
    console.log(`[BILLING-GET] Fetching subscription for workspace: ${workspaceId}`);
    
    const sub = await Subscription.findOne({ workspace: workspaceId }).lean();
    const workspace = await Workspace.findById(workspaceId).lean();
    
    const legacy = workspace?.billing?.plan;
    const legacyPlan = legacy === 'Team' ? 'TEAM' : legacy === 'Pro' ? 'PRO' : legacy === 'Free' ? 'FREE' : null;
    const plan = workspace?.plan || legacyPlan || 'FREE';
    console.log(`[BILLING-GET] Current plan: ${plan}`);
    
    res.json({
      subscription: sub || null,
      plan: plan,
      stripeCustomerId: workspace?.billing?.stripeCustomerId || null
    });
  } catch(err){
    console.error(`[BILLING-GET] Error:`, err.message);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createPortalSession(req, res){
  try{
    const { workspaceId } = req.params;
    let frontendUrl = req.headers.origin;
    if (!frontendUrl) {
      frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',')[0] : 'http://localhost:5173';
    }
    const returnUrl = `${frontendUrl}/workspaces/${workspaceId}/billing`;
    
    if (!process.env.STRIPE_SECRET) return res.status(500).json({ message: 'Stripe is not configured. Set STRIPE_SECRET.' });
    if (process.env.STRIPE_SECRET.startsWith('sk_live_')) return res.status(400).json({ message: 'Live Stripe keys are not allowed. Use Stripe Test Mode keys only.' });

    const stripe = new Stripe(process.env.STRIPE_SECRET);
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const customerId = workspace.billing?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ message: 'No Stripe customer found for this workspace. Please subscribe first.' });
    
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    res.json({ url: session.url });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Failed to create billing portal session' });
  }
}

async function verifySession(req, res) {
  try {
    const { workspaceId } = req.params;
    const { session_id } = req.body;
    
    console.log(`[BILLING-VERIFY] Verifying session: ${session_id} for workspace: ${workspaceId}`);
    
    if (!session_id) return res.status(400).json({ message: 'session_id required' });
    if (!process.env.STRIPE_SECRET) return res.status(500).json({ message: 'Stripe is not configured. Set STRIPE_SECRET.' });
    if (process.env.STRIPE_SECRET.startsWith('sk_live_')) return res.status(400).json({ message: 'Live Stripe keys are not allowed. Use Stripe Test Mode keys only.' });

    const stripe = new Stripe(process.env.STRIPE_SECRET);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      success: true,
      payment_status: session.payment_status,
      subscription: session.subscription || null
    });
  } catch(err) {
    console.error('[BILLING-VERIFY] Unexpected error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Failed to verify session' });
  }
}

module.exports = { createCheckout, getSubscription, createPortalSession, verifySession };
