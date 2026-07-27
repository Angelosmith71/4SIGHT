import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion:'2024-11-20.acacia' });
const PRODUCTS = [
  { name:'Guardian AI Pro', metadata:{plan_id:'pro'}, prices:[
    { nickname:'Pro Monthly', unit_amount:4900, currency:'usd', interval:'month', env:'NEXT_PUBLIC_STRIPE_PRO_MONTHLY' },
    { nickname:'Pro Yearly', unit_amount:44900, currency:'usd', interval:'year', env:'NEXT_PUBLIC_STRIPE_PRO_YEARLY' },
  ]},
  { name:'Guardian AI Enterprise', metadata:{plan_id:'enterprise'}, prices:[
    { nickname:'Enterprise Monthly', unit_amount:9900, currency:'usd', interval:'month', env:'NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY' },
    { nickname:'Enterprise Yearly', unit_amount:89900, currency:'usd', interval:'year', env:'NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY' },
  ]},
];
async function main() {
  console.log('\n🛡 Guardian AI — Stripe Setup\n'); const envLines=[];
  for (const product of PRODUCTS) {
    console.log(`📦 ${product.name}`);
    const existing=await stripe.products.search({query:`name:"${product.name}"`});
    let prod=existing.data[0];
    if(!prod){ prod=await stripe.products.create({name:product.name,metadata:product.metadata}); console.log(`   Created: ${prod.id}`); } else { console.log(`   Exists: ${prod.id}`); }
    for (const price of product.prices) {
      const existing2=await stripe.prices.list({product:prod.id,active:true,currency:price.currency});
      const match=existing2.data.find(p=>p.unit_amount===price.unit_amount&&p.recurring?.interval===price.interval);
      let priceObj=match;
      if(!priceObj){ priceObj=await stripe.prices.create({product:prod.id,nickname:price.nickname,unit_amount:price.unit_amount,currency:price.currency,recurring:{interval:price.interval},metadata:{plan_id:product.metadata.plan_id}}); console.log(`   Price created: ${priceObj.id}`); } else { console.log(`   Price exists: ${priceObj.id}`); }
      envLines.push(`${price.env}=${priceObj.id}`);
    }
  }
  console.log('\n✅ Add to .env.local:\n'); console.log(envLines.join('\n')); console.log('\n');
}
main().catch(e=>{ console.error('❌',e.message); process.exit(1); });
