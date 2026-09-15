import type { NavRoute } from '@/types';
export const NAV_ROUTES: NavRoute[] = [
  { section:'monitor', label:'Overview',    href:'/dashboard',             icon:'⬛' },
  { section:'monitor', label:'Threats',     href:'/dashboard/threats',     icon:'🛡', badge:3 },
  { section:'monitor', label:'Family Watch',href:'/dashboard/parental-monitor', icon:'👨‍👩‍👧‍👦', badge:2 },
  { section:'monitor', label:'Live Feed',   href:'/dashboard/live-feed',   icon:'📡' },
  { section:'monitor', label:'Bot Monitor', href:'/dashboard/bot-monitor', icon:'🤖' },
  { section:'analyze', label:'Analytics',   href:'/dashboard/analytics',   icon:'📈' },
  { section:'analyze', label:'Reports',     href:'/dashboard/reports',     icon:'📄' },
  { section:'analyze', label:'Logs',        href:'/dashboard/logs',        icon:'🗄' },
  { section:'system',  label:'Agents',      href:'/dashboard/agents',      icon:'👥' },
  { section:'system',  label:'Config',      href:'/dashboard/config',      icon:'⚙️' },
];
