'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { HudPageHeader, HudTag, HudBar } from '@/components/ui/HudPrimitives';
import { HudSkeleton } from '@/components/ui/HudSkeleton';
import { useParentalMonitoring } from '@/hooks/useData';
import { ParentalNotifySettings } from '@/components/dashboard/ParentalNotifySettings';
import { ChildProfileModal } from '@/components/dashboard/ChildProfileModal';
import { ChildDevicePairing } from '@/components/dashboard/ChildDevicePairing';
import type { ChildFormData } from '@/components/dashboard/ChildProfileModal';
import { loadParentalSettings, loadSentAlertIds, markAlertSent } from '@/lib/parental/settings';
import { cardVariant, listVariant } from '@/utils/animations';
import type { DbChildProfile, DbParentalAlert, DbViewingActivity } from '@/lib/supabase/types';
import { contentExceedsFilter, contentFilterInfo } from '@/lib/parental/content-filter';
import { formatScreenTime, screenTimePct, screenTimeStatus, SCREEN_TIME_STATUS_COLOR } from '@/lib/parental/screen-time';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Rating = 'safe' | 'review' | 'flagged';

const SEV: Record<Severity, { color: string; label: string }> = {
  critical: { color: '#FF2E4C', label: 'CRITICAL' },
  high:     { color: '#FFB648', label: 'HIGH' },
  medium:   { color: '#A45CFF', label: 'MEDIUM' },
  low:      { color: '#00E6FF', label: 'LOW' },
};

const RATING: Record<Rating, { color: string; label: string }> = {
  safe:   { color: '#00FF9C', label: 'SAFE' },
  review: { color: '#FFB648', label: 'REVIEW' },
  flagged:{ color: '#FF2E4C', label: 'FLAGGED' },
};

function relTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}

function ChildCard({ child, selected, onClick, onEdit, onDelete }: {
  child: DbChildProfile; selected: boolean; onClick: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  const statusColor = child.status === 'online' ? '#00FF9C' : child.status === 'restricted' ? '#FF2E4C' : '#666';
  const stStatus = screenTimeStatus(child.screen_time_mins, child.screen_time_limit_mins ?? 0);
  const stColor = SCREEN_TIME_STATUS_COLOR[stStatus];
  const hasLimit = (child.screen_time_limit_mins ?? 0) > 0;
  const filter = contentFilterInfo(child.content_filter ?? 'PG');
  return (
    <motion.div variants={cardVariant}
      className={`relative rounded-sm border transition-all overflow-hidden
        ${selected ? 'border-electricCyan/50 bg-electricCyan/8' : 'border-white/8 bg-white/[0.02] hover:border-white/20'}`}>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-electricCyan/40" />
      <button type="button" onClick={onClick} className="w-full text-left p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-sm flex items-center justify-center border border-electricCyan/25 bg-electricCyan/8">
            <i className={`ti ${child.avatar_icon}`} style={{ fontSize: 22, color: '#00E6FF' }} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-rajdhani font-bold text-[15px] text-white">{child.name}</span>
              <span className="font-mono text-[9px] text-white/30">Age {child.age}</span>
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm border" style={{ color: filter.color, borderColor: `${filter.color}40`, background: `${filter.color}12` }}>
                {filter.label} max
              </span>
            </div>
            <p className="font-mono text-[9px] text-white/35 truncate">{child.device}</p>
          </div>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor, boxShadow: child.status === 'online' ? `0 0 8px ${statusColor}` : undefined }} />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="font-mono text-[9px] text-white/30">
            <span style={{ color: stColor }}>{formatScreenTime(child.screen_time_mins)}</span>
            {hasLimit ? ` / ${formatScreenTime(child.screen_time_limit_mins)}` : ' · no limit'}
          </div>
          {hasLimit && (
            <div className="h-1 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${screenTimePct(child.screen_time_mins, child.screen_time_limit_mins)}%`,
                background: stColor,
              }} />
            </div>
          )}
          <div className="font-mono text-[9px] text-white/30"><span className="text-neoCrimson">{child.alerts_today}</span> alerts today</div>
        </div>
      </button>
      <div className="flex border-t border-white/5">
        <button type="button" onClick={e => { e.stopPropagation(); onEdit(); }}
          className="flex-1 font-mono text-[8px] tracking-[1px] uppercase py-1.5 text-white/30 hover:text-electricCyan hover:bg-electricCyan/5 transition-colors">
          Edit
        </button>
        <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
          className="flex-1 font-mono text-[8px] tracking-[1px] uppercase py-1.5 text-white/30 hover:text-neoCrimson hover:bg-neoCrimson/5 transition-colors border-l border-white/5">
          Remove
        </button>
      </div>
    </motion.div>
  );
}

function ActivityRow({ item, contentFilter }: { item: DbViewingActivity; contentFilter?: DbChildProfile['content_filter'] }) {
  const r = RATING[item.rating as Rating] || RATING.safe;
  const blocked = contentFilter ? contentExceedsFilter(contentFilter, item.rating) : false;
  return (
    <motion.div variants={cardVariant}
      className={`relative flex items-center gap-3 p-3 rounded-sm border overflow-hidden
        ${blocked ? 'border-neoCrimson/35 bg-neoCrimson/5' : 'border-white/8 bg-white/[0.02]'}`}>
      <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 border" style={{ background: `${r.color}12`, borderColor: `${r.color}35`, color: r.color }}>
        <i className={`ti ${item.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[9px] text-white/30">{item.platform}</span>
          <span className="font-mono text-[9px] text-white/20">·</span>
          <span className="font-mono text-[9px] text-white/30">{item.child_name}</span>
        </div>
        <p className="font-rajdhani text-[13px] text-white truncate">{item.title}</p>
        <p className="font-mono text-[9px] text-white/25">{item.duration_mins}m · {relTime(item.created_at)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <HudTag label={r.label} color={r.color} />
        {blocked && <HudTag label="BLOCKED" color="#FF2E4C" />}
      </div>
    </motion.div>
  );
}

function AlertRow({ alert, onRead, onNotify }: { alert: DbParentalAlert; onRead: () => void; onNotify: () => void }) {
  const s = SEV[alert.severity as Severity] || SEV.medium;
  return (
    <motion.div layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      className={`relative p-3 rounded-sm border overflow-hidden transition-all
        ${alert.read ? 'border-white/6 bg-white/[0.01] opacity-60' : 'border-neoCrimson/30 bg-neoCrimson/5'}`}>
      {!alert.read && <span className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background: s.color }} />}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 border cursor-pointer" style={{ background: `${s.color}15`, borderColor: `${s.color}40`, color: s.color }} onClick={onRead}>
          <i className={`ti ${alert.icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onRead}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-rajdhani font-semibold text-[13px] text-white">{alert.title}</span>
            {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-neoCrimson animate-pulse" />}
          </div>
          <p className="font-mono text-[10px] text-white/45 leading-relaxed">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <HudTag label={s.label} color={s.color} />
            <span className="font-mono text-[9px] text-white/25">{alert.child_name} · {relTime(alert.created_at)}</span>
            {alert.action_taken && (
              <span className="font-mono text-[9px] uppercase tracking-[1px] text-electricCyan/60">{alert.action_taken}</span>
            )}
          </div>
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onNotify(); }}
          title="Send email & SMS to parent"
          className="flex-shrink-0 w-8 h-8 rounded-sm border border-electricCyan/25 bg-electricCyan/8 text-electricCyan hover:bg-electricCyan/15 transition-colors flex items-center justify-center">
          <i className="ti ti-send" style={{ fontSize: 14 }} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

export function ParentalMonitorPage() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { children, activity, alerts, unreadAlerts, loading, markAlertRead, saveChild, deleteChild } = useParentalMonitoring(selectedChildId);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<DbChildProfile | null>(null);

  async function notifyForAlert(alertId: string) {
    const settings = loadParentalSettings();
    if (!settings.email && !settings.phone) {
      setToast({ msg: 'Add parent email or phone in notification settings below', ok: false });
      return;
    }
    try {
      const res = await fetch('/api/parental/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          email: settings.emailEnabled ? settings.email : undefined,
          phone: settings.smsEnabled ? settings.phone : undefined,
          sendEmail: settings.emailEnabled,
          sendSms: settings.smsEnabled,
        }),
      });
      const json = await res.json();
      setToast({ msg: json.demo ? 'Demo: parent notified (simulated)' : json.message ?? 'Sent', ok: json.ok });
      if (json.ok) markAlertSent(alertId);
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Notify failed', ok: false });
    }
  }

  useEffect(() => {
    const settings = loadParentalSettings();
    if (!settings.autoNotifyCritical || loading) return;
    if (!settings.email && !settings.phone) return;
    const sent = loadSentAlertIds();
    alerts
      .filter(a => !sent.has(a.id) && (a.severity === 'critical' || a.severity === 'high'))
      .forEach(a => { void notifyForAlert(a.id); });
  }, [alerts, loading]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifyEnabled(Notification.permission === 'granted');
    }
  }, []);

  async function requestNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifyEnabled(perm === 'granted');
    if (perm === 'granted' && alerts[0]) {
      new Notification('Guardian Parental Monitor', { body: alerts.find(a => !a.read)?.title ?? 'Alerts enabled', icon: '/favicon.ico' });
    }
  }

  const selectedChild = children.find(c => c.id === selectedChildId);
  const flaggedCount = activity.filter(a => a.rating === 'flagged').length;
  const selectedLimit = selectedChild?.screen_time_limit_mins ?? 0;
  const selectedStStatus = selectedChild ? screenTimeStatus(selectedChild.screen_time_mins, selectedLimit) : 'ok';
  const selectedStColor = SCREEN_TIME_STATUS_COLOR[selectedStStatus];
  const selectedFilter = selectedChild ? contentFilterInfo(selectedChild.content_filter ?? 'PG') : null;
  const childFilterMap = Object.fromEntries(children.map(c => [c.id, c.content_filter ?? 'PG' as const]));

  function openAddChild() {
    setEditingChild(null);
    setModalOpen(true);
  }

  function openEditChild(child: DbChildProfile) {
    setEditingChild(child);
    setModalOpen(true);
  }

  async function handleSaveChild(data: ChildFormData) {
    const saved = await saveChild(data, editingChild?.id);
    setToast({ msg: editingChild ? `${saved.name} updated` : `${saved.name} added`, ok: true });
    if (!editingChild) setSelectedChildId(saved.id);
  }

  async function handleDeleteChild(child: DbChildProfile) {
    if (!window.confirm(`Remove ${child.name}'s profile?`)) return;
    try {
      await deleteChild(child.id);
      if (selectedChildId === child.id) setSelectedChildId(null);
      setToast({ msg: `${child.name} removed`, ok: true });
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : 'Delete failed', ok: false });
    }
  }

  return (
    <PageShell>
      <ChildProfileModal
        open={modalOpen}
        child={editingChild}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveChild}
      />
      <div className="flex flex-col flex-1 overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(ellipse 55% 35% at 50% 0%,rgba(164,92,255,0.07) 0%,transparent 65%)' }}>
        <div className="px-4 md:px-8 pt-5 pb-4 flex-shrink-0 border-b border-white/5">
          <HudPageHeader
            eyebrow="// parental monitoring · under 18"
            title="Family Watch"
            right={
              <div className="flex items-center gap-2 flex-wrap">
                {unreadAlerts > 0 && (
                  <motion.div animate={{ boxShadow: ['0 0 0px rgba(255,46,76,0)', '0 0 14px rgba(255,46,76,0.5)', '0 0 0px rgba(255,46,76,0)'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="font-mono text-[10px] px-3 py-1.5 rounded-sm bg-neoCrimson/10 border border-neoCrimson/40 text-neoCrimson flex items-center gap-2">
                    <i className="ti ti-bell-ringing" style={{ fontSize: 14 }} aria-hidden="true" />
                    {unreadAlerts} NEW ALERT{unreadAlerts !== 1 ? 'S' : ''}
                  </motion.div>
                )}
                <button onClick={requestNotifications}
                  className={`font-mono text-[9px] tracking-[1px] uppercase px-3 py-1.5 rounded-sm border transition-colors
                    ${notifyEnabled ? 'border-emeraldPulse/40 text-emeraldPulse bg-emeraldPulse/8' : 'border-white/15 text-white/40 hover:border-electricCyan/40 hover:text-electricCyan'}`}>
                  <i className={`ti ${notifyEnabled ? 'ti-bell-check' : 'ti-bell-plus'}`} style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
                  {notifyEnabled ? 'Alerts on' : 'Enable alerts'}
                </button>
              </div>
            }
          />
          <p className="font-mono text-[10px] text-white/30 mt-2 max-w-2xl">
            Monitor what children under 18 watch online. Flagged content triggers instant parent alerts.
            Full device monitoring requires the Guardian agent on each child device.
          </p>

          {/* Guardian Agent setup */}
          <details className="mt-4 rounded-sm border border-electricCyan/15 bg-electricCyan/5 overflow-hidden group">
            <summary className="font-mono text-[10px] tracking-[1px] text-electricCyan/70 uppercase px-4 py-2.5 cursor-pointer hover:bg-electricCyan/8 transition-colors list-none flex items-center gap-2">
              <i className="ti ti-device-mobile" style={{ fontSize: 14 }} aria-hidden="true" />
              Set up Guardian Agent on child devices
              <span className="ml-auto text-white/25 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 pt-1 border-t border-electricCyan/10">
              <ol className="font-mono text-[10px] text-white/45 space-y-2 list-decimal list-inside">
                <li><a href="/guardian-extension.zip" download className="text-emeraldPulse hover:underline font-bold">Download the Extension ZIP here</a> and extract it on the child's device.</li>
                <li>In Chrome on the child device, open <span className="text-electricCyan">chrome://extensions</span> → enable Developer mode → Load unpacked → select the extracted <span className="text-white/60">guardian-extension/</span> folder.</li>
                <li>On this dashboard, select a child → <span className="text-electricCyan">Link device</span> → copy the 6-character code.</li>
                <li>Click the Guardian extension icon → enter server URL (<span className="text-white/60">http://localhost:3000</span> for local dev) and the pairing code.</li>
                <li>Set content filters (G, PG, PG-13) and screen-time limits per child — the extension enforces them automatically.</li>
              </ol>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="font-mono text-[9px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-emeraldPulse/30 text-emeraldPulse bg-emeraldPulse/8">Chrome Extension · ready</span>
                {['iOS Agent', 'Android Agent', 'Router DNS'].map(label => (
                  <span key={label} className="font-mono text-[9px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-white/10 text-white/35">{label} · coming soon</span>
                ))}
              </div>
            </div>
          </details>

          <div className="mt-4">
            <ParentalNotifySettings onNotifyResult={(msg, ok) => setToast({ msg, ok })} />
          </div>
        </div>

        {toast && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className={`mx-4 md:mx-8 mb-2 px-4 py-2 rounded-sm border font-mono text-[10px] whitespace-pre-wrap
              ${toast.ok ? 'border-emeraldPulse/30 bg-emeraldPulse/8 text-emeraldPulse' : 'border-neoCrimson/30 bg-neoCrimson/8 text-neoCrimson'}`}>
            {toast.msg}
            <button type="button" onClick={() => setToast(null)} className="float-right opacity-60 hover:opacity-100">×</button>
          </motion.div>
        )}

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Children panel */}
          <div className="lg:w-[260px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] tracking-[2px] text-white/25 uppercase">Children</p>
              <button type="button" onClick={openAddChild}
                className="font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-electricCyan/30 text-electricCyan hover:bg-electricCyan/10 transition-colors">
                + Add
              </button>
            </div>
            {loading ? (
              <HudSkeleton rows={3} height="h-[88px]" />
            ) : (
              <motion.div variants={listVariant} initial="hidden" animate="visible" className="flex flex-col gap-2">
                <button onClick={() => setSelectedChildId(null)}
                  className={`font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm border mb-1 transition-all
                    ${!selectedChildId ? 'bg-electricCyan/10 border-electricCyan/50 text-electricCyan' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                  All children
                </button>
                {children.map(c => (
                  <ChildCard key={c.id} child={c} selected={selectedChildId === c.id}
                    onClick={() => setSelectedChildId(c.id)}
                    onEdit={() => openEditChild(c)}
                    onDelete={() => handleDeleteChild(c)} />
                ))}
                {children.length === 0 && (
                  <p className="font-mono text-[10px] text-white/25 text-center py-6">No children yet. Click + Add.</p>
                )}
              </motion.div>
            )}
            {!loading && selectedChild && selectedFilter && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="p-2.5 rounded-sm border border-white/8 bg-white/[0.02]">
                  <p className="font-mono text-[8px] text-white/30 uppercase tracking-[1px] mb-1">Content filter</p>
                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani font-bold text-lg" style={{ color: selectedFilter.color }}>{selectedFilter.label}</span>
                    <span className="font-mono text-[9px] text-white/35">{selectedFilter.desc}</span>
                  </div>
                </div>
                <HudBar
                  pct={selectedLimit > 0 ? screenTimePct(selectedChild.screen_time_mins, selectedLimit) : 0}
                  color={selectedStColor}
                  label={selectedLimit > 0 ? `Screen time (${formatScreenTime(selectedLimit)} limit)` : 'Screen time (no limit)'}
                  value={selectedLimit > 0
                    ? `${formatScreenTime(selectedChild.screen_time_mins)} / ${formatScreenTime(selectedLimit)}`
                    : formatScreenTime(selectedChild.screen_time_mins)}
                />
                {selectedStStatus === 'over' && (
                  <p className="font-mono text-[8px] text-neoCrimson">Daily limit reached — device can be restricted via Guardian Agent.</p>
                )}
                {selectedStStatus === 'warning' && (
                  <p className="font-mono text-[8px] text-[#FFB648]">Approaching daily limit (80%+).</p>
                )}
                <ChildDevicePairing child={selectedChild} onToast={(msg, ok) => setToast({ msg, ok })} />
                <button type="button" onClick={() => openEditChild(selectedChild)}
                  className="w-full font-mono text-[8px] tracking-[1px] uppercase py-1.5 rounded-sm border border-plasmaViolet/30 text-plasmaViolet hover:bg-plasmaViolet/10 transition-colors">
                  Edit profile & filters
                </button>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-[9px] tracking-[2px] text-electricCyan/40 uppercase">Live viewing activity</p>
                <h2 className="font-rajdhani font-bold text-lg text-white">
                  {selectedChild ? `${selectedChild.name}'s activity` : 'All activity'}
                </h2>
              </div>
              {flaggedCount > 0 && (
                <span className="font-mono text-[10px] px-2 py-1 rounded-sm bg-neoCrimson/10 border border-neoCrimson/30 text-neoCrimson">
                  {flaggedCount} flagged
                </span>
              )}
            </div>
            {loading ? (
              <HudSkeleton rows={5} height="h-[64px]" />
            ) : activity.length === 0 ? (
              <p className="font-mono text-[11px] text-white/25 text-center mt-16">No viewing activity recorded.</p>
            ) : (
              <motion.div variants={listVariant} initial="hidden" animate="visible" className="flex flex-col gap-2">
                {activity.map(item => (
                  <ActivityRow key={item.id} item={item} contentFilter={childFilterMap[item.child_id]} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Alerts panel */}
          <div className="lg:w-[320px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 p-4 overflow-y-auto bg-neoCrimson/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <i className="ti ti-bell" style={{ fontSize: 16, color: '#FF2E4C' }} aria-hidden="true" />
              <div>
                <p className="font-mono text-[9px] tracking-[2px] text-neoCrimson/50 uppercase">Parent notifications</p>
                <h2 className="font-rajdhani font-bold text-base text-white">Alerts</h2>
              </div>
            </div>
            {loading ? (
              <HudSkeleton rows={4} height="h-[80px]" />
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="flex flex-col gap-2">
                  {alerts.map(a => (
                    <AlertRow key={a.id} alert={a} onRead={() => !a.read && markAlertRead(a.id)} onNotify={() => notifyForAlert(a.id)} />
                  ))}
                  {alerts.length === 0 && (
                    <p className="font-mono text-[11px] text-white/25 text-center mt-8">No alerts yet.</p>
                  )}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
