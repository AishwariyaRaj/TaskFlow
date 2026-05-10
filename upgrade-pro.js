const mongoose = require('mongoose');
require('dotenv').config();

const Workspace = require('./src/models/Workspace');
const Subscription = require('./src/models/Subscription');

const MONGO_URI = process.env.MONGO_URI;
const WORKSPACE_ID = '69fe08f22807ef44cca586bd';

async function upgradeWorkspace() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Update Workspace plan
    const workspace = await Workspace.findById(WORKSPACE_ID);
    if (!workspace) {
      console.error('Workspace not found');
      process.exit(1);
    }

    workspace.plan = 'PRO';
    await workspace.save();
    console.log(`Workspace ${WORKSPACE_ID} updated to PRO plan`);

    // 2. Update/Create Subscription
    let subscription = await Subscription.findOne({ workspace: WORKSPACE_ID });
    
    if (subscription) {
      subscription.status = 'active';
      // Optionally set a far future date if we don't have stripe info
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      await subscription.save();
      console.log('Existing subscription updated to active');
    } else {
      subscription = new Subscription({
        workspace: WORKSPACE_ID,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      await subscription.save();
      console.log('New subscription created for the workspace');
    }

    console.log('Upgrade complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

upgradeWorkspace();
