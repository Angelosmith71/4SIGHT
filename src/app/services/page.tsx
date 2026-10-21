'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ContactModal } from '@/components/ui/ContactModal';

const SERVICES = [
  {
    name: 'Guardian dashboard',
    price: 'Free, then Pro $49/mo or Enterprise $99/mo',
    color: '#A45CFF',
    href: '/pricing',
    link: 'View plans',
    summary: 'One place for threats, cookies, trackers, the live feed, and reports.',
    points: [
      'Cookie Shield blocks tracking cookies that profile you across sites.',
      'Bot Monitor watches bots that try to scan cookies, clipboard, or history.',
      'Live Feed and reports show what was detected and what was stopped.',
    ],
  },
  {
    name: 'Family Watch',
    price: '$20/mo after a 7-day trial',
    color: '#00FF9C',
    href: '/pricing/family-watch',
    link: 'View Family Watch',
    summary: 'Alerts when a child under 18 opens restricted content.',
    points: [
      'Set a content level and a daily screen-time limit for each child.',
      'Get an alert on the dashboard, and by email or text when it is set up.',
      'This plan is separate from Pro and Enterprise.',
    ],
  },
  {
    name: 'Grok Advisor',
    price: 'Included with the dashboard',
    color: '#A45CFF',
    href: '/signup',
    link: 'Open the dashboard',
    summary: 'Plain-language explanations of threats, logs, and Family Watch alerts already on your dashboard.',
    points: [
      'Ask what a threat means and what to do next.',
      'This chat is not a separate bill.',
    ],
  },
  {
    name: 'Grok xAI Agent',
    price: '$15/mo after a 7-day trial',
    color: '#FFB648',
    href: '/pricing/groq-agent',
    link: 'View Grok xAI Agent',
    summary: 'Paid Grok answers on threats, privacy, and Family Watch, using your dashboard context.',
    points: [
      '500,000 tokens each billing month.',
      'Separate from Pro and from Grok Advisor.',
    ],
  },
  {
    name: 'Protocol Check',
    price: '$49/mo after a 7-day trial',
    color: '#00E6FF',
    href: '/pricing/protocol-watch',
    link: 'View Protocol Check',
    summary: 'Checks connected business bots against the rules you write.',
    points: [
      'Register up to 3 bots and list allowed tools, allowed data, and forbidden actions.',
      'Each reported step comes back as pass or fail, with the rule that broke.',
      'Only bots you connect are checked. A pass covers that step.',
    ],
  },
];

const BENEFITS = [
  { title: 'See it as it happens', text: 'Threats, cookies, and tracker events show up in the dashboard instead of staying hidden in the browser.' },
  { title: 'Keep each job on its own plan', text: 'Family monitoring and business-bot checks are add-ons. You turn on the one you need.' },
  { title: 'Get an answer in plain language', text: 'Grok Advisor explains a dashboard event. Grok xAI Agent is the paid version when you want that chat on its own plan.' },
  { title: 'Cancel from Billing', text: 'Family Watch, Grok xAI Agent, and Protocol Check can each be canceled from the billing page.' },
];

export default function ServicesPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="min-h-screen bg-deepVoid" style={{ backgroundImage: 'linear-gradient(rgba(0,230,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.018) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 h-[56px] bg-deepVoid/90 backdrop-blur-md border-b border-electricCyan/10">
        <Link href="/" className="flex items-center gap-3 font-rajdhani font-bold text-base tracking-[3px]">
          <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-10 h-10 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_15px_rgba(0,230,255,0.35)] flex-shrink-0" />
          <span>4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
        </Link>
        <div className="hidden md:flex gap-6 font-mono text-[10px]">
          <Link href="/" className="text-white/35 hover:text-electricCyan uppercase">Home</Link>
          <span className="text-electricCyan uppercase">Services</span>
          <Link href="/about" className="text-white/35 hover:text-electricCyan uppercase">About</Link>
          <a href="mailto:INFO@4SIGHTGUARDIANAI.NET" className="text-white/35 hover:text-electricCyan uppercase">INFO@4SIGHTGUARDIANAI.NET</a>
          <Link href="/pricing" className="text-white/35 hover:text-electricCyan uppercase">Pricing</Link>
          <button onClick={() => setIsContactOpen(true)} className="text-white/35 hover:text-electricCyan uppercase focus:outline-none">Contact</button>
        </div>
        <Link href="/signup"><motion.button whileHover={{scale:1.03,boxShadow:'0 0 16px rgba(0,230,255,0.3)'}} whileTap={{scale:0.97}} className="relative font-mono text-[9px] tracking-[1.5px] uppercase px-4 py-2 rounded-sm border border-electricCyan/40 text-electricCyan bg-electricCyan/8 overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/60"/>» Start Free</motion.button></Link>
      </nav>

      <section className="relative text-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%,rgba(0,230,255,0.1) 0%,transparent 65%)' }} />
        <p className="font-mono text-[10px] tracking-[3px] text-electricCyan/45 uppercase mb-4">// services</p>
        <h1 className="font-rajdhani font-bold text-4xl md:text-5xl text-white tracking-wide mb-4">What 4Sight Guardian AI offers</h1>
        <p className="font-mono text-[11px] text-white/35 max-w-xl mx-auto leading-[1.9]">A dashboard for threats and trackers, plus separate plans for family monitoring, Grok, and business-bot checks.</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-8 flex flex-col gap-4">
        {SERVICES.map(service => (
          <motion.article key={service.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-sm border p-6 overflow-hidden" style={{ borderColor: `${service.color}30`, background: `${service.color}08` }}>
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: service.color }} />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: service.color }} />
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h2 className="font-rajdhani font-bold text-2xl text-white">{service.name}</h2>
              <p className="font-mono text-[10px]" style={{ color: service.color }}>{service.price}</p>
            </div>
            <p className="font-mono text-[11px] text-white/55 mt-2 leading-relaxed">{service.summary}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {service.points.map(point => (
                <li key={point} className="font-mono text-[10px] text-white/45 leading-relaxed flex gap-2">
                  <span style={{ color: service.color }}>✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link href={service.href} className="inline-block mt-4 font-mono text-[10px] tracking-[1px] uppercase hover:underline" style={{ color: service.color }}>{service.link} →</Link>
          </motion.article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-[10px] text-electricCyan/40">«</span>
          <h2 className="font-rajdhani font-bold text-xl text-white tracking-[2px]">Benefits</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BENEFITS.map(benefit => (
            <div key={benefit.title} className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-rajdhani font-bold text-lg text-electricCyan">{benefit.title}</h3>
              <p className="font-mono text-[10px] text-white/45 mt-2 leading-[1.8]">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center px-6 py-16 border-t border-white/5">
        <h2 className="font-rajdhani font-bold text-3xl text-white mb-3">Start with the free dashboard</h2>
        <p className="font-mono text-[11px] text-white/30 mb-8">Add Family Watch, Grok xAI Agent, or Protocol Check when you need them.</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup" className="px-8 py-3.5 rounded-sm border border-plasmaViolet/50 text-plasmaViolet bg-plasmaViolet/12 font-mono text-[11px] tracking-[1.5px] uppercase">» Start free</Link>
          <Link href="/pricing" className="px-8 py-3.5 rounded-sm border border-electricCyan/30 text-electricCyan font-mono text-[11px] tracking-[1.5px] uppercase">See pricing</Link>
        </div>
      </section>

      <footer className="flex items-center justify-between px-6 md:px-8 py-6 border-t border-white/5 flex-wrap gap-4">
        <div className="flex items-center gap-3 font-rajdhani font-bold text-sm tracking-[2px]">
          <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-7 h-7 rounded-md object-cover border border-electricCyan/40 shadow-[0_0_10px_rgba(0,230,255,0.25)] flex-shrink-0" />
          <span>4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
        </div>
        <p className="font-mono text-[10px] text-white/30">
          © {new Date().getFullYear()} 4Sight Guardian AI. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="mailto:INFO@4SIGHTGUARDIANAI.NET" className="font-mono text-[9px] text-white/30 hover:text-electricCyan transition-colors uppercase">INFO@4SIGHTGUARDIANAI.NET</a>
          <div className="flex items-center gap-2"><motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:2,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/><span className="font-mono text-[9px] text-white/20 italic">Analyzing AI threats in real time...</span></div>
        </div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
