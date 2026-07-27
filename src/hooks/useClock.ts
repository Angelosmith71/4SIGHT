'use client';
import { useState, useEffect } from 'react';
function formatTime(d: Date) { const p=(n:number)=>String(n).padStart(2,'0'); return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; }
export function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => { setTime(formatTime(new Date())); const id=setInterval(()=>setTime(formatTime(new Date())),1000); return ()=>clearInterval(id); }, []);
  return time;
}
