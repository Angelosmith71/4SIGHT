'use client';
import { motion } from 'framer-motion';
export function HudSkeleton({ rows=4, height='h-12' }: { rows?:number; height?:string }) {
  return <div className="flex flex-col gap-2.5">{Array.from({length:rows}).map((_,i)=><motion.div key={i} animate={{opacity:[0.3,0.6,0.3]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.15}} className={`${height} rounded-sm border border-white/6 bg-white/[0.03]`}/>)}</div>;
}
export function HudMetricSkeleton() {
  return <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_1fr] gap-5 items-center">{[0,1].map(i=><div key={i} className="flex flex-col gap-3">{[0,1].map(j=><motion.div key={j} animate={{opacity:[0.3,0.6,0.3]}} transition={{duration:1.5,repeat:Infinity,delay:(i*2+j)*0.12}} className="h-[78px] rounded-sm border border-white/6 bg-white/[0.03]"/>)}</div>)}<div className="flex justify-center"><motion.div animate={{opacity:[0.3,0.6,0.3]}} transition={{duration:1.5,repeat:Infinity}} className="w-[210px] h-[210px] rounded-full border border-white/6 bg-white/[0.02]"/></div></div>;
}
