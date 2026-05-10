const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please paste your Stripe Secret Key (starts with sk_test_...): ', async (secretKey) => {
  secretKey = secretKey.trim();
  if (!secretKey.startsWith('sk_')) {
    console.log('Invalid key format. Should start with sk_');
    rl.close();
    return;
  }

  try {
    const stripe = new Stripe(secretKey);
    
    console.log('\nCreating Stripe Products...');
    
    // Create Pro Plan
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'For growing teams that need more power'
    });
    
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1200, // $12.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`✅ Pro Plan created (Price ID: ${proPrice.id})`);

    // Create Team Plan
    const teamProduct = await stripe.products.create({
      name: 'Team Plan',
      description: 'For large organizations with advanced needs'
    });
    
    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log(`✅ Team Plan created (Price ID: ${teamPrice.id})`);

    // Update .env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/STRIPE_SECRET=.*/, `STRIPE_SECRET=${secretKey}`);
    
    if (envContent.includes('STRIPE_PRICE_PRO=')) {
      envContent = envContent.replace(/STRIPE_PRICE_PRO=.*/, `STRIPE_PRICE_PRO=${proPrice.id}`);
    } else {
      envContent += `\nSTRIPE_PRICE_PRO=${proPrice.id}`;
    }

    if (envContent.includes('STRIPE_PRICE_TEAM=')) {
      envContent = envContent.replace(/STRIPE_PRICE_TEAM=.*/, `STRIPE_PRICE_TEAM=${teamPrice.id}`);
    } else {
      envContent += `\nSTRIPE_PRICE_TEAM=${teamPrice.id}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n🎉 Successfully updated .env with your Stripe keys!');
    console.log('You just need to setup your webhook using the Stripe CLI next.\n');

  } catch (err) {
    console.error('Error setting up Stripe:', err.message);
  } finally {
    rl.close();
  }
});
