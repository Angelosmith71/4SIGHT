import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
export async function POST(_: NextRequest) {
  try { const sb=await createClient(); const{data:{user}}=await sb.auth.getUser(); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401}); const{data:sub}=await sb.from('subscriptions').select('stripe_customer_id').eq('user_id',user.id).single(); if(!sub?.stripe_customer_id) return NextResponse.json({error:'No billing account'},{status:404}); const session=await stripe.billingPortal.sessions.create({customer:sub.stripe_customer_id,return_url:`${process.env.NEXT_PUBLIC_APP_URL??'http://localhost:3000'}/billing`}); return NextResponse.json({url:session.url}); } catch(e:unknown){ return NextResponse.json({error:e instanceof Error?e.message:'Error'},{status:500}); }
}
