const mongoose = require('mongoose');
require('dotenv').config();
const Workspace = require('./src/models/Workspace');
const Subscription = require('./src/models/Subscription');

const WORKSPACE_ID = '6a00954f80392dc31ad8281e';

async function forceTeam() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const workspace = await Workspace.findById(WORKSPACE_ID);
    if (!workspace) {
      console.error('Workspace not found');
      process.exit(1);
    }

    workspace.plan = 'TEAM';
    await workspace.save();
    console.log(`Workspace ${WORKSPACE_ID} plan updated to TEAM`);

    // Ensure a subscription record exists to prevent middleware from reverting it
    const sub = await Subscription.findOneAndUpdate(
      { workspace: WORKSPACE_ID },
      {
        workspace: WORKSPACE_ID,
        priceId: process.env.STRIPE_PRICE_TEAM,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      { upsert: true, new: true }
    );
    console.log('Subscription record updated/created');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

forceTeam();
