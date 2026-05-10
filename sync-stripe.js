const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function syncStripe() {
  const secretKey = process.env.STRIPE_SECRET;
  
  if (!secretKey || !secretKey.startsWith('sk_')) {
    console.error('❌ Error: STRIPE_SECRET is missing or invalid in .env file.');
    return;
  }

  const stripe = new Stripe(secretKey);

  try {
    console.log('⏳ Syncing Stripe Products and Prices...');

    // 1. Create or Get Pro Plan
    console.log('📦 Setting up Pro Plan ($12)...');
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'For growing teams that need more power',
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1200, // $12.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`✅ Pro Plan: ${proPrice.id}`);

    // 2. Create or Get Team Plan
    console.log('📦 Setting up Team Plan ($29)...');
    const teamProduct = await stripe.products.create({
      name: 'Team Plan',
      description: 'For large organizations with advanced needs',
    });

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`✅ Team Plan: ${teamPrice.id}`);

    // 3. Update .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      // Update STRIPE_PRICE_PRO
      if (envContent.includes('STRIPE_PRICE_PRO=')) {
        envContent = envContent.replace(/STRIPE_PRICE_PRO=.*/, `STRIPE_PRICE_PRO=${proPrice.id}`);
      } else {
        envContent += `\nSTRIPE_PRICE_PRO=${proPrice.id}`;
      }

      // Update STRIPE_PRICE_TEAM
      if (envContent.includes('STRIPE_PRICE_TEAM=')) {
        envContent = envContent.replace(/STRIPE_PRICE_TEAM=.*/, `STRIPE_PRICE_TEAM=${teamPrice.id}`);
      } else {
        envContent += `\nSTRIPE_PRICE_TEAM=${teamPrice.id}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log('\n🎉 Successfully updated .env with new Price IDs!');
    } else {
      console.error('❌ Error: .env file not found at ' + envPath);
    }

  } catch (error) {
    console.error('❌ Stripe Error:', error.message);
  }
}

syncStripe();
