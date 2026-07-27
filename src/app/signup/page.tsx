'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_COOKIE, isDemoMode } from '@/lib/demo';

function enterDemoSession() {
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isDemoMode()) {
        enterDemoSession();
        router.push('/dashboard');
        return;
      }
      const sb = createClient();
      const { error: err } = await sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (err) throw err;
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="min-h-screen bg-deepVoid flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm p-8 rounded-sm border border-emeraldPulse/30 bg-graphite/90 text-center overflow-hidden">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emeraldPulse/50" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emeraldPulse/50" />
        <div className="w-12 h-12 rounded-full border border-emeraldPulse/40 bg-emeraldPulse/10 flex items-center justify-center mx-auto mb-4"><i className="ti ti-check" style={{ color: '#00FF9C', fontSize: 24 }} /></div>
        <h2 className="font-rajdhani font-bold text-xl text-white mb-2">Account Created</h2>
        <p className="font-mono text-[10px] text-white/40 mb-5">Check your email to confirm, then log in.</p>
        <Link href="/login" className="font-mono text-[10px] text-electricCyan/70 hover:text-electricCyan">» Go to Login</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deepVoid flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,255,156,0.05) 0%,transparent 65%),linear-gradient(rgba(0,230,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.02) 1px,transparent 1px)', backgroundSize: '100% 100%,32px 32px,32px 32px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="flex items-center justify-center gap-3 mb-2"><img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-12 h-12 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_18px_rgba(0,230,255,0.35)] flex-shrink-0" /><h1 className="font-rajdhani font-bold text-2xl tracking-[3px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></h1></div><p className="font-mono text-[10px] text-white/25 uppercase tracking-[2px]">Request Access</p></div>
        {isDemoMode() && (
          <p className="font-mono text-[9px] text-emeraldPulse/70 text-center mb-4 px-3 py-2 border border-emeraldPulse/20 rounded-sm bg-emeraldPulse/5">
            Demo mode — create account goes straight to the dashboard.
          </p>
        )}
        <div className="relative p-6 rounded-sm border border-white/10 bg-graphite/90 overflow-hidden">
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emeraldPulse/50" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emeraldPulse/50" />
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5"><label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Full Name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Guardian Operator" className="bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40" /></div>
            <div className="flex flex-col gap-1.5"><label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="operator@guardian.ai" className="bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40" /></div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="w-full bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 pr-10 font-mono text-[12px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-electricCyan text-xs focus:outline-none" title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            {error && <p className="font-mono text-[10px] text-neoCrimson px-3 py-2 border border-neoCrimson/30 bg-neoCrimson/8 rounded-sm">{error}</p>}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="relative py-3 rounded-sm border border-emeraldPulse/40 bg-emeraldPulse/8 text-emeraldPulse font-mono text-[11px] tracking-[2px] uppercase disabled:opacity-40 overflow-hidden">
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-emeraldPulse/60" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-emeraldPulse/60" />
              {loading ? 'Creating Account...' : '» Create Account'}
            </motion.button>
          </form>
          <p className="font-mono text-[9px] text-white/25 text-center mt-5">Already have access? <Link href="/login" className="text-electricCyan/60 hover:text-electricCyan">Login »</Link></p>
        </div>
      </motion.div>
    </div>
  );
}
