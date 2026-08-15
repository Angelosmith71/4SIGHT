'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const copyEmail = () => {
    navigator.clipboard.writeText('info@4sightguardian.ai');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API request/GoDaddy integration delay
    setTimeout(() => {
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-deepVoid/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md p-6 rounded-sm border border-electricCyan/25 bg-graphite/95 shadow-[0_0_50px_rgba(0,230,255,0.15)] overflow-hidden z-10"
          >
            {/* Cyber Corner Guards */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-electricCyan/60" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-electricCyan/60" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-electricCyan/60" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-electricCyan/60" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-electricCyan/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-electricCyan animate-ping" />
                <h3 className="font-rajdhani font-bold text-lg text-white tracking-[2px] uppercase">» Establish Connection</h3>
              </div>
              <button
                onClick={onClose}
                className="font-mono text-white/40 hover:text-neoCrimson transition-colors text-xs focus:outline-none"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Email Quick Copy Box */}
            <div className="mb-5 p-3.5 rounded-sm border border-electricCyan/12 bg-electricCyan/5 flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] text-electricCyan/60 tracking-[1.5px] uppercase">Direct Channel</span>
                <span className="font-mono text-[12px] text-white/90 font-bold select-all">info@4sightguardian.ai</span>
              </div>
              <motion.button
                onClick={copyEmail}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`font-mono text-[9px] uppercase px-3 py-1.5 rounded-sm border transition-all ${
                  copied
                    ? 'border-emeraldPulse/50 text-emeraldPulse bg-emeraldPulse/10'
                    : 'border-white/15 text-white/60 hover:border-electricCyan/45 hover:text-electricCyan'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </motion.button>
            </div>

            {/* Description */}
            <p className="font-mono text-[9.5px] text-white/35 leading-relaxed mb-4">
              Send us a transmission below. All messages are directly routed to our GoDaddy Messages Portal for immediate response.
            </p>

            {/* Form */}
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-10 text-center flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full border border-emeraldPulse/40 bg-emeraldPulse/10 flex items-center justify-center">
                  <span className="text-emeraldPulse text-xl">✓</span>
                </div>
                <h4 className="font-rajdhani font-bold text-md text-white tracking-[1px] uppercase">Transmission Sent</h4>
                <p className="font-mono text-[9px] text-white/40">Secure connection established. Routing to GoDaddy portal...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[8.5px] text-white/30 uppercase tracking-[1px]">Operator Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-black/35 border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[8.5px] text-white/30 uppercase tracking-[1px]">Return Address (Email)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@domain.com"
                    className="bg-black/35 border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[8.5px] text-white/30 uppercase tracking-[1px]">Transmission details</label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="bg-black/35 border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40 resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'sending'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative py-2.5 mt-2 rounded-sm border border-electricCyan/40 bg-electricCyan/8 text-electricCyan font-mono text-[10px] tracking-[2px] uppercase disabled:opacity-40 overflow-hidden"
                >
                  <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-electricCyan/60" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-electricCyan/60" />
                  {status === 'sending' ? 'Sending Transmission...' : '» Send Transmission'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
