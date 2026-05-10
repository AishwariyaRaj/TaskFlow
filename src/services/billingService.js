const Stripe = require('stripe');
const Subscription = require('../models/Subscription');
const Workspace = require('../models/Workspace');

function getStripe() {
  const secret = process.env.STRIPE_SECRET;
  if (!secret) throw new Error('STRIPE_SECRET is not set');
  if (secret.startsWith('sk_live_')) throw new Error('Live Stripe keys are not allowed. Use Stripe Test Mode keys only.');
  return new Stripe(secret);
}

function normalizePlan(plan) {
  if (!plan) return null;
  const upper = String(plan).trim().toUpperCase();
  if (upper === 'PRO') return 'PRO';
  if (upper === 'TEAM') return 'TEAM';
  return null;
}

function resolvePlanFromPriceId(priceId) {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_TEAM) return 'TEAM';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'PRO';
  return null;
}

async function createCheckoutSession({ workspaceId, successUrl, cancelUrl, priceId, email, plan }){
  const stripe = getStripe();
  const targetPlan = normalizePlan(plan) || resolvePlanFromPriceId(priceId);
  if (!targetPlan) throw new Error('Invalid plan. Allowed: PRO, TEAM');
  if (!priceId) throw new Error('priceId is required');

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error('Workspace not found');

  let customerId = workspace.billing?.stripeCustomerId;
  
  if (customerId) {
    try {
      // Verify if customer exists in Stripe
      await stripe.customers.retrieve(customerId);
    } catch (err) {
      if (err.code === 'resource_missing' || err.message.includes('No such customer')) {
        customerId = null; // Mark as invalid to trigger recreation
      } else {
        throw err;
      }
    }
  }

  if (!customerId){
    const customer = await stripe.customers.create({
      email,
      metadata: { workspaceId: String(workspaceId) }
    });
    customerId = customer.id;
    workspace.billing = workspace.billing || {};
    workspace.billing.stripeCustomerId = customerId;
    if (!workspace.plan) workspace.plan = 'FREE';
    await workspace.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { workspaceId: String(workspaceId), targetPlan },
    subscription_data: {
      metadata: { workspaceId: String(workspaceId), targetPlan }
    }
  });
  return session;
}

async function handleWebhookEvent(evt){
  const stripe = getStripe();
  const type = evt.type;
  if (type === 'checkout.session.completed'){
    const session = evt.data.object;
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    const workspaceId = session.metadata && session.metadata.workspaceId;
    const targetPlan = session.metadata && session.metadata.targetPlan;
    if (!subscriptionId || !customerId || !workspaceId) return;

    const subs = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subs.items.data[0].price.id;
    const status = subs.status;
    const currentPeriodEnd = new Date(subs.current_period_end * 1000);

    await Subscription.findOneAndUpdate({ workspace: workspaceId }, {
      workspace: workspaceId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      priceId,
      status,
      currentPeriodEnd
    }, { upsert: true });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return;
    const resolvedPlan = normalizePlan(targetPlan) || resolvePlanFromPriceId(priceId);
    if (resolvedPlan) workspace.plan = resolvedPlan;
    workspace.billing = workspace.billing || {};
    workspace.billing.stripeCustomerId = customerId;
    await workspace.save();
  } else if (type === 'customer.subscription.updated' || type === 'customer.subscription.created'){
    const subs = evt.data.object;
    const subscriptionId = subs.id;
    const customerId = subs.customer;
    const priceId = subs.items.data[0].price.id;
    const status = subs.status;
    const currentPeriodEnd = new Date(subs.current_period_end * 1000);

    await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      priceId,
      status,
      currentPeriodEnd
    }, { upsert: true });

    const workspaceId = subs.metadata && subs.metadata.workspaceId;
    const targetPlan = subs.metadata && subs.metadata.targetPlan;
    const workspace = workspaceId
      ? await Workspace.findById(workspaceId)
      : await Workspace.findOne({ 'billing.stripeCustomerId': customerId });
    if (workspace) {
      const resolvedPlan = normalizePlan(targetPlan) || resolvePlanFromPriceId(priceId);
      if (resolvedPlan) workspace.plan = resolvedPlan;
      workspace.billing = workspace.billing || {};
      if (!workspace.billing.stripeCustomerId) workspace.billing.stripeCustomerId = customerId;
      await workspace.save();
    }
  } else if (type === 'invoice.payment_failed'){
    const invoice = evt.data.object;
    const subscriptionId = invoice.subscription;
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { status: 'past_due' });
  } else if (type === 'invoice.payment_succeeded'){
    const invoice = evt.data.object;
    const subscriptionId = invoice.subscription;
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { status: 'active' });
  } else if (type === 'customer.subscription.deleted'){
    const subs = evt.data.object;
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: subs.id }, { status: 'canceled' });
    
    const workspaceId = subs.metadata && subs.metadata.workspaceId;
    const workspace = workspaceId
      ? await Workspace.findById(workspaceId)
      : await Workspace.findOne({ 'billing.stripeCustomerId': subs.customer });
    if (workspace) {
      workspace.plan = 'FREE';
      await workspace.save();
    }
  }
}

module.exports = { createCheckoutSession, handleWebhookEvent, normalizePlan, resolvePlanFromPriceId };
