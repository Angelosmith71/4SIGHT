'use client';
import { useState, useEffect } from 'react';
export function useCounter(initial: number, intervalMs=3000, probability=0.6) {
  const [count, setCount] = useState(initial);
  useEffect(() => { const id=setInterval(()=>{ if(Math.random()>probability) setCount(c=>c+1); },intervalMs); return ()=>clearInterval(id); },[intervalMs,probability]);
  return count;
}
