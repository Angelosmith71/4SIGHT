'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { checkActivity } from '@/lib/protocol/check';
import { readProtocolDemo, writeProtocolDemo, type DemoBot, type DemoCheck } from '@/lib/protocol/demo-store';
import { isDemoMode } from '@/lib/demo';
import { PROTOCOL_WATCH_PLAN } from '@/lib/stripe/protocol-plan';

interface BotRow {
  id: string;
  name: string;
  job: string;
  allowedTools: string;
  allowedData: string;
  forbiddenActions: string;
  apiKeyPrefix: string;
  apiKey?: string;
}

interface CheckRow {
  id: string;
  botId: string;
  botName: string;
  verdict: 'pass' | 'fail';
  violation: string | null;
  createdAt: string;
}

function fromDemoBot(bot: DemoBot): BotRow {
  return {
    id: bot.id,
    name: bot.name,
    job: bot.job,
    allowedTools: bot.allowedTools,
    allowedData: bot.allowedData,
    forbiddenActions: bot.forbiddenActions,
    apiKeyPrefix: bot.apiKeyPrefix,
    apiKey: bot.apiKey,
  };
}

export function ProtocolWatchPage() {
  const demo = isDemoMode();
  const [bots, setBots] = useState<BotRow[]>([]);
  const [checks, setChecks] = useState<CheckRow[]>([]);
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [allowedTools, setAllowedTools] = useState('');
  const [allowedData, setAllowedData] = useState('');
  const [forbiddenActions, setForbiddenActions] = useState('');
  const [botId, setBotId] = useState('');
  const [tool, setTool] = useState('');
  const [data, setData] = useState('');
  const [action, setAction] = useState('');
  const [prompt, setPrompt] = useState('');
  const [freshKey, setFreshKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (demo) {
      const state = readProtocolDemo();
      setBots(state.bots.map(fromDemoBot));
      setChecks(state.checks);
      return;
    }
    void (async () => {
      const [botRes, checkRes] = await Promise.all([
        fetch('/api/protocol/bots'),
        fetch('/api/protocol/check'),
      ]);
      const botJson = await botRes.json();
      const checkJson = await checkRes.json();
      const rows: BotRow[] = (botJson.bots ?? []).map((bot: {
        id: string; name: string; job: string; allowed_tools: string; allowed_data: string; forbidden_actions: string; api_key_prefix: string;
      }) => ({
        id: bot.id,
        name: bot.name,
        job: bot.job,
        allowedTools: bot.allowed_tools,
        allowedData: bot.allowed_data,
        forbiddenActions: bot.forbidden_actions,
        apiKeyPrefix: bot.api_key_prefix,
      }));
      setBots(rows);
      const names = new Map(rows.map(bot => [bot.id, bot.name]));
      setChecks((checkJson.checks ?? []).map((row: {
        id: string; bot_id: string; verdict: 'pass' | 'fail'; violation: string | null; created_at: string;
      }) => ({
        id: row.id,
        botId: row.bot_id,
        botName: names.get(row.bot_id) ?? 'Bot',
        verdict: row.verdict,
        violation: row.violation,
        createdAt: row.created_at,
      })));
    })();
  }, [demo]);

  const latest = checks[0];
  const latestFail = latest?.verdict === 'fail' ? latest : null;

  async function registerBot(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name the bot.');
      return;
    }
    if (bots.length >= PROTOCOL_WATCH_PLAN.botLimit) {
      setError(`Protocol Check includes ${PROTOCOL_WATCH_PLAN.botLimit} bots.`);
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        const apiKey = `pw_${crypto.randomUUID().replace(/-/g, '')}`;
        const bot: DemoBot = {
          id: crypto.randomUUID(),
          name: name.trim(),
          job: job.trim(),
          allowedTools: allowedTools.trim(),
          allowedData: allowedData.trim(),
          forbiddenActions: forbiddenActions.trim(),
          apiKey,
          apiKeyPrefix: `${apiKey.slice(0, 10)}…`,
        };
        const state = readProtocolDemo();
        state.bots = [bot, ...state.bots];
        writeProtocolDemo(state);
        setBots(state.bots.map(fromDemoBot));
        setFreshKey(apiKey);
      } else {
        const res = await fetch('/api/protocol/bots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, job, allowedTools, allowedData, forbiddenActions }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Could not register the bot');
        setBots(prev => [{
          id: json.bot.id,
          name: json.bot.name,
          job: json.bot.job,
          allowedTools: json.bot.allowed_tools,
          allowedData: json.bot.allowed_data,
          forbiddenActions: json.bot.forbidden_actions,
          apiKeyPrefix: json.bot.api_key_prefix,
        }, ...prev]);
        setFreshKey(json.apiKey);
      }
      setName('');
      setJob('');
      setAllowedTools('');
      setAllowedData('');
      setForbiddenActions('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not register the bot');
    } finally {
      setBusy(false);
    }
  }

  async function runCheck(event: FormEvent) {
    event.preventDefault();
    setError('');
    const bot = bots.find(row => row.id === botId);
    if (!bot) {
      setError('Choose a bot.');
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        const result = checkActivity(
          { job: bot.job, allowedTools: bot.allowedTools, allowedData: bot.allowedData, forbiddenActions: bot.forbiddenActions },
          { prompt, tool, data, action },
        );
        const check: DemoCheck = {
          id: crypto.randomUUID(),
          botId: bot.id,
          botName: bot.name,
          verdict: result.verdict,
          violation: result.violation,
          createdAt: new Date().toISOString(),
        };
        const state = readProtocolDemo();
        state.checks = [check, ...state.checks].slice(0, 20);
        writeProtocolDemo(state);
        setChecks(state.checks);
      } else {
        const res = await fetch('/api/protocol/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, prompt, tool, data, action }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Check failed');
        setChecks(prev => [{
          id: json.check.id,
          botId: bot.id,
          botName: bot.name,
          verdict: json.verdict,
          violation: json.violation,
          createdAt: json.check.created_at,
        }, ...prev]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Check failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <p className="font-mono text-[11px] text-white/45 leading-relaxed max-w-2xl">
        Write the protocol for each business bot, then check the steps it reports. Sign-in stays separate. Only bots you connect are checked.
      </p>

      {latestFail && (
        <div className="rounded-sm border border-neoCrimson/40 bg-neoCrimson/10 px-4 py-3">
          <p className="font-mono text-[9px] tracking-[1px] uppercase text-neoCrimson">Outside protocol</p>
          <p className="font-mono text-[11px] text-white/80 mt-1">
            <span className="text-neoCrimson">{latestFail.botName}:</span> {latestFail.violation}
          </p>
        </div>
      )}

      {freshKey && (
        <div className="rounded-sm border border-electricCyan/30 bg-electricCyan/8 px-4 py-3">
          <p className="font-mono text-[9px] tracking-[1px] uppercase text-electricCyan">API key — copy it now</p>
          <p className="font-mono text-[11px] text-white mt-1 break-all">{freshKey}</p>
        </div>
      )}

      {error && <p className="font-mono text-[10px] text-neoCrimson">{error}</p>}

      <form onSubmit={registerBot} className="rounded-sm border border-white/10 p-4 flex flex-col gap-3">
        <p className="font-mono text-[9px] tracking-[1px] uppercase text-white/30">Register a bot · {bots.length}/{PROTOCOL_WATCH_PLAN.botLimit}</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Bot name" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={job} onChange={e => setJob(e.target.value)} placeholder="What this bot is for" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={allowedTools} onChange={e => setAllowedTools(e.target.value)} placeholder="Allowed tools, separated by commas" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={allowedData} onChange={e => setAllowedData(e.target.value)} placeholder="Allowed data, separated by commas" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={forbiddenActions} onChange={e => setForbiddenActions(e.target.value)} placeholder="Forbidden actions, separated by commas" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <button type="submit" disabled={busy} className="self-start font-mono text-[10px] tracking-[1px] uppercase px-4 py-2 rounded-sm border border-electricCyan/40 text-electricCyan disabled:opacity-50">
          {busy ? 'Saving…' : 'Save bot'}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {bots.map(bot => (
          <div key={bot.id} className="rounded-sm border border-white/10 px-4 py-3">
            <p className="font-rajdhani font-bold text-white">{bot.name}</p>
            <p className="font-mono text-[10px] text-white/40 mt-1">{bot.job || 'No job description'}</p>
            <p className="font-mono text-[10px] text-white/35 mt-1">Tools: {bot.allowedTools || '—'} · Data: {bot.allowedData || '—'} · Forbidden: {bot.forbiddenActions || '—'}</p>
            <p className="font-mono text-[10px] text-electricCyan/70 mt-1">Key {bot.apiKeyPrefix}</p>
          </div>
        ))}
        {bots.length === 0 && <p className="font-mono text-[10px] text-white/30">No bots registered yet.</p>}
      </div>

      <form onSubmit={runCheck} className="rounded-sm border border-white/10 p-4 flex flex-col gap-3">
        <p className="font-mono text-[9px] tracking-[1px] uppercase text-white/30">Check a step</p>
        <select value={botId} onChange={e => setBotId(e.target.value)} className="bg-deepVoid border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white">
          <option value="">Choose a bot</option>
          {bots.map(bot => <option key={bot.id} value={bot.id}>{bot.name}</option>)}
        </select>
        <input value={tool} onChange={e => setTool(e.target.value)} placeholder="Tool used" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={data} onChange={e => setData(e.target.value)} placeholder="Data read" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={action} onChange={e => setAction(e.target.value)} placeholder="Action taken" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Prompt or reply" className="bg-transparent border border-white/10 rounded-sm px-3 py-2 font-mono text-[11px] text-white placeholder:text-white/25" />
        <button type="submit" disabled={busy} className="self-start font-mono text-[10px] tracking-[1px] uppercase px-4 py-2 rounded-sm border border-solarAmber/40 text-solarAmber disabled:opacity-50">
          {busy ? 'Checking…' : 'Run check'}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {checks.map(check => (
          <div key={check.id} className="flex items-start justify-between gap-3 rounded-sm border border-white/10 px-4 py-3">
            <div>
              <p className="font-mono text-[11px] text-white/80">{check.botName}</p>
              <p className="font-mono text-[10px] text-white/40 mt-1">{check.violation ?? 'This step stayed inside the protocol.'}</p>
            </div>
            <span className={`font-mono text-[10px] uppercase ${check.verdict === 'pass' ? 'text-emeraldPulse' : 'text-neoCrimson'}`}>{check.verdict}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
