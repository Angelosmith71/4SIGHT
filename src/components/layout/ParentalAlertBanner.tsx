'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function ParentalAlertBanner() {
  const pathname = usePathname();
  const [alert, setAlert] = useState<{ title: string; child_name: string; unread: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const notifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/dashboard/parental-monitor')) return;

    async function poll() {
      try {
        const res = await fetch('/api/parental');
        const json = await res.json();
        const unread = json.unread_alerts ?? 0;
        const latest = (json.alerts ?? []).find((a: { read: boolean; id: string; title: string; child_name: string }) => !a.read);
        if (unread > 0 && latest) {
          setAlert({ title: latest.title, child_name: latest.child_name, unread });
          if (notifiedRef.current !== latest.id && typeof window !== 'undefined' && 'Notification' in window && typeof Notification === 'function' && Notification.permission === 'granted') {
            notifiedRef.current = latest.id;
            try {
              new Notification('Guardian Family Watch', { body: `${latest.child_name}: ${latest.title}` });
            } catch { /* ignore mobile Notification constructor restriction */ }
          }
        } else {
          setAlert(null);
          setDismissed(false);
        }
      } catch { /* ignore */ }
    }

    poll();
    const iv = setInterval(poll, 25000);
    return () => clearInterval(iv);
  }, [pathname]);

  const show = alert && !dismissed && !pathname.startsWith('/dashboard/parental-monitor');

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="mx-4 mt-2 flex-shrink-0 relative rounded-sm border border-neoCrimson/40 bg-neoCrimson/10 overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-neoCrimson" />
          <div className="flex items-center gap-3 px-4 py-2.5">
            <i className="ti ti-bell-ringing text-neoCrimson" style={{ fontSize: 18 }} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-neoCrimson/70 uppercase tracking-[1px]">Family Watch · {alert.unread} alert{alert.unread !== 1 ? 's' : ''}</p>
              <p className="font-rajdhani text-[13px] text-white truncate"><span className="text-neoCrimson">{alert.child_name}:</span> {alert.title}</p>
            </div>
            <Link href="/dashboard/parental-monitor"
              className="font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm border border-neoCrimson/50 text-neoCrimson hover:bg-neoCrimson/15 transition-colors flex-shrink-0">
              View
            </Link>
            <button onClick={() => setDismissed(true)} aria-label="Dismiss"
              className="font-mono text-white/30 hover:text-white/60 text-sm flex-shrink-0">×</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
