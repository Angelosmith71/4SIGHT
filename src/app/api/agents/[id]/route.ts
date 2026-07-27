import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { const{id}=await params; const sb=await createClient(); const{data:{user}}=await sb.auth.getUser(); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401}); const body=await request.json(); const{data,error}=await sb.from('agents').update({...body,last_seen:new Date().toISOString()}).eq('id',id).select().single(); if(error) throw error; return NextResponse.json({data}); } catch(e:unknown){ return NextResponse.json({error:e instanceof Error?e.message:'Error'},{status:500}); }
}
