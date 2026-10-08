'use client';

import { useEffect, useState } from 'react';

type InstallChoice = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = '4sight-install-dismissed';

export function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallChoice | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone || localStorage.getItem(DISMISS_KEY) === '1') return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    if (ios) {
      setIosHint(true);
      setHidden(false);
    }

    function onPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as InstallChoice);
      setHidden(false);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === 'accepted') setHidden(true);
  }

  if (hidden || (!promptEvent && !iosHint)) return null;

  return (
    <div className="fixed z-[60] left-3 right-3 md:left-auto md:right-4 md:w-80 bottom-[72px] md:bottom-4 rounded-sm border border-electricCyan/30 bg-graphite/95 backdrop-blur px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
      <p className="font-mono text-[9px] tracking-[2px] text-electricCyan/60 uppercase">Install 4Sight</p>
      <p className="font-mono text-[11px] text-white/70 mt-1 leading-relaxed">
        {iosHint && !promptEvent
          ? 'Add 4Sight to your Home Screen from the Share menu, then Add to Home Screen.'
          : 'Install 4Sight on this device. It opens full screen, with the same dashboard and billing.'}
      </p>
      <div className="flex gap-2 mt-3">
        {promptEvent && (
          <button type="button" onClick={() => void install()}
            className="font-mono text-[9px] tracking-[1px] uppercase px-3 py-2 rounded-sm border border-electricCyan/40 bg-electricCyan/10 text-electricCyan">
            Install app
          </button>
        )}
        <button type="button" onClick={dismiss}
          className="font-mono text-[9px] tracking-[1px] uppercase px-3 py-2 rounded-sm border border-white/15 text-white/40">
          Not now
        </button>
      </div>
    </div>
  );
}
