const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
  workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  priceId: { type: String },
  status: { type: String },
  currentPeriodEnd: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
