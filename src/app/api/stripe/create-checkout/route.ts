import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/stripe/plans';
export async function POST(request: NextRequest) {
  try {
    const sb=await createClient(); const{data:{user}}=await sb.auth.getUser(); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
    const{planId,interval}:{planId:PlanId;interval:BillingInterval}=await request.json();
    const plan=PLANS.find(p=>p.id===planId); if(!plan||planId==='free') return NextResponse.json({error:'Invalid plan'},{status:400});
    const priceId=interval==='year'?plan.stripePriceIdYearly:plan.stripePriceIdMonthly; if(!priceId) return NextResponse.json({error:'Price not configured'},{status:500});
    const{data:sub}=await sb.from('subscriptions').select('stripe_customer_id').eq('user_id',user.id).single();
    let customerId=sub?.stripe_customer_id;
    if(!customerId){ const c=await stripe.customers.create({email:user.email,metadata:{supabase_user_id:user.id}}); customerId=c.id; await sb.from('subscriptions').upsert({user_id:user.id,stripe_customer_id:customerId},{onConflict:'user_id'}); }
    const appUrl=process.env.NEXT_PUBLIC_APP_URL??'http://localhost:3000';
    const session=await stripe.checkout.sessions.create({ customer:customerId, mode:'subscription', payment_method_types:['card'], line_items:[{price:priceId,quantity:1}], subscription_data:{ trial_period_days:14, metadata:{supabase_user_id:user.id,plan_id:planId} }, success_url:`${appUrl}/billing?success=true&plan=${planId}`, cancel_url:`${appUrl}/pricing?canceled=true`, metadata:{supabase_user_id:user.id,plan_id:planId} });
    return NextResponse.json({url:session.url});
  } catch(e:unknown){ return NextResponse.json({error:e instanceof Error?e.message:'Error'},{status:500}); }
}
