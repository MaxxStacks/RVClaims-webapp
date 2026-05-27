// client/src/pages/exclusive/dealer-owner/RemindersDashboard.tsx
// Service Reminders configuration page — dealer_owner / service_manager

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ServiceReminder {
  id: string;
  dealershipId: string;
  name: string;
  templateType: string;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  subject: string;
  message: string;
  includeProductPromotion: boolean;
  promotedProductIds?: string[];
  isActive: boolean;
  recipientFilter: Record<string, unknown>;
  lastSentAt?: string;
  sendCount: number;
  createdAt: string;
}

interface ReminderStats {
  activeReminders: number;
  sendsThisMonth: number;
  deliveryRate: number;
  optOutRate: number;
}

interface SendHistoryRow {
  id: string;
  reminderName: string;
  customerName: string;
  channel: string;
  status: string;
  sentAt: string;
}

// ─── Template defaults ─────────────────────────────────────────────────────────

const TEMPLATE_DEFAULTS: Record<string, { subject: string; message: string }> = {
  winterization: {
    subject: 'Winter is coming — protect your RV',
    message: 'Hi {{customerName}}, winter is approaching and your {{unitYear}} {{unitMake}} {{unitModel}} needs winterization to prevent costly damage. Book your appointment with {{dealerName}} today to ensure your RV is fully protected.',
  },
  de_winterization: {
    subject: 'Spring is here — time to de-winterize your RV',
    message: 'Hi {{customerName}}, spring has arrived! Your {{unitYear}} {{unitMake}} {{unitModel}} is ready to hit the road once we complete your de-winterization service. Contact {{dealerName}} to schedule.',
  },
  spring_prep: {
    subject: 'Get your RV road-ready for spring',
    message: 'Hi {{customerName}}, before your first trip this season, let us give your {{unitYear}} {{unitMake}} {{unitModel}} a full spring inspection. {{dealerName}} can help you start the season right.',
  },
  warranty_expiry: {
    subject: 'Your warranty is expiring soon',
    message: 'Hi {{customerName}}, your {{unitYear}} {{unitMake}} {{unitModel}} warranty expires on {{expiryDate}}. Contact {{dealerName}} to discuss extended warranty options before your coverage ends.',
  },
  annual_service: {
    subject: 'Time for your annual RV service',
    message: 'Hi {{customerName}}, it has been a year since your {{unitYear}} {{unitMake}} {{unitModel}} was serviced. Annual maintenance keeps your RV in peak condition. Book with {{dealerName}} today.',
  },
  custom: {
    subject: '',
    message: '',
  },
};

const TEMPLATE_LABELS: Record<string, string> = {
  winterization: 'Winterization',
  de_winterization: 'De-Winterization',
  spring_prep: 'Spring Prep',
  warranty_expiry: 'Warranty Expiry',
  annual_service: 'Annual Service',
  custom: 'Custom',
};

const VARIABLES = ['{{customerName}}', '{{unitYear}}', '{{unitMake}}', '{{unitModel}}', '{{dealerName}}', '{{expiryDate}}'];

// ─── Create Reminder Form ──────────────────────────────────────────────────────

interface CreateFormProps {
  dealershipId: string;
  onSaved: () => void;
  onCancel: () => void;
}

function CreateReminderForm({ dealershipId, onSaved, onCancel }: CreateFormProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [templateType, setTemplateType] = useState('winterization');
  const [triggerType, setTriggerType] = useState<'date_based' | 'event_based'>('date_based');
  const [triggerDate, setTriggerDate] = useState('');
  const [daysBefore, setDaysBefore] = useState('30');
  const [triggerEvent, setTriggerEvent] = useState('warranty_expiry');
  const [subject, setSubject] = useState(TEMPLATE_DEFAULTS.winterization.subject);
  const [message, setMessage] = useState(TEMPLATE_DEFAULTS.winterization.message);
  const [includePromo, setIncludePromo] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'warranty' | 'unit_type'>('all');
  const [previewData, setPreviewData] = useState<{ subject: string; message: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTemplateChange = (type: string) => {
    setTemplateType(type);
    const defaults = TEMPLATE_DEFAULTS[type];
    if (defaults) {
      setSubject(defaults.subject);
      setMessage(defaults.message);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const data = await apiFetch<{ success: boolean; preview: { subject: string; message: string } }>(
        '/api/reminders/preview',
        { method: 'POST', body: JSON.stringify({ subject, message }) }
      );
      if (data.success) setPreviewData(data.preview);
    } catch {
      // silent
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError(t('reminder.nameRequired') ?? 'Name is required'); return; }
    if (!subject.trim()) { setError(t('reminder.subjectRequired') ?? 'Subject is required'); return; }
    if (!message.trim()) { setError(t('reminder.messageRequired') ?? 'Message is required'); return; }
    setSaving(true);
    setError('');
    try {
      const triggerConfig: Record<string, unknown> = triggerType === 'date_based'
        ? { date: triggerDate }
        : { daysBefore: Number(daysBefore), event: triggerEvent };

      const filter: Record<string, unknown> = recipientFilter === 'all'
        ? { allCustomers: true }
        : recipientFilter === 'warranty'
        ? { warrantyExpiring: true }
        : { allCustomers: true };

      await apiFetch('/api/reminders', {
        method: 'POST',
        body: JSON.stringify({
          dealershipId,
          name: name.trim(),
          templateType,
          triggerType,
          triggerConfig,
          subject: subject.trim(),
          message: message.trim(),
          includeProductPromotion: includePromo,
          recipientFilter: filter,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminderStats'] });
      onSaved();
    } catch {
      setError(t('reminder.saveFailed') ?? 'Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, padding: '24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('reminder.create')}</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18, lineHeight: 1, padding: '2px 6px' }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
        {/* Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>
            {t('reminder.name') ?? 'Reminder Name'} *
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('reminder.namePlaceholder') ?? 'e.g. Fall Winterization 2026'}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box' }}
          />
        </div>

        {/* Template Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>
            {t('reminder.templateType')} *
          </label>
          <select
            value={templateType}
            onChange={e => handleTemplateChange(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', cursor: 'pointer' }}
          >
            {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Trigger Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>
            {t('reminder.triggerType')}
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 6 }}>
            {(['date_based', 'event_based'] as const).map(tt => (
              <label key={tt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text, #333)' }}>
                <input type="radio" checked={triggerType === tt} onChange={() => setTriggerType(tt)} />
                {tt === 'date_based' ? t('reminder.dateBased') : t('reminder.eventBased')}
              </label>
            ))}
          </div>
        </div>

        {/* Trigger Config */}
        {triggerType === 'date_based' ? (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>Send Date</label>
            <input type="date" value={triggerDate} onChange={e => setTriggerDate(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>Days Before</label>
              <input type="number" min={1} max={365} value={daysBefore} onChange={e => setDaysBefore(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>Event</label>
              <select value={triggerEvent} onChange={e => setTriggerEvent(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', cursor: 'pointer' }}>
                <option value="warranty_expiry">Warranty Expiry</option>
                <option value="last_service">Last Service Date</option>
              </select>
            </div>
          </div>
        )}

        {/* Subject */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>
            {t('reminder.subject')} *
          </label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box' }} />
        </div>

        {/* Message */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>
            {t('reminder.message')} *
          </label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          {/* Variable helper */}
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#888', marginRight: 4 }}>Variables:</span>
            {VARIABLES.map(v => (
              <button key={v} onClick={() => setMessage(m => m + ' ' + v)}
                style={{ fontSize: 10, background: '#f0f5ff', border: '1px solid #c7d4f0', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', color: '#033280', fontFamily: 'inherit' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient filter */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #666)', display: 'block', marginBottom: 5 }}>Recipient Filter</label>
          <select value={recipientFilter} onChange={e => setRecipientFilter(e.target.value as any)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', cursor: 'pointer' }}>
            <option value="all">All Customers</option>
            <option value="warranty">Warranty Expiring (90 days)</option>
          </select>
        </div>

        {/* Promo toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text, #333)' }}>
            <input type="checkbox" checked={includePromo} onChange={e => setIncludePromo(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#0cb22c', cursor: 'pointer' }} />
            Include Product Promotion
          </label>
        </div>
      </div>

      {/* Preview area */}
      {previewData && (
        <div style={{ marginTop: 16, background: '#f8faff', border: '1px solid #c7d4f0', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#033280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #111)', marginBottom: 6 }}>{previewData.subject}</div>
          <div style={{ fontSize: 13, color: 'var(--text, #444)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{previewData.message}</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '10px 14px', fontSize: 13, color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={handlePreview} disabled={previewLoading}
          style={{ padding: '8px 16px', background: 'none', border: '1px solid #c7d4f0', borderRadius: 7, fontSize: 13, color: '#033280', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
          {previewLoading ? 'Loading…' : t('reminder.preview')}
        </button>
        <button onClick={onCancel}
          style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '8px 20px', background: saving ? '#a3d9a5' : '#0cb22c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving…' : 'Save Reminder'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function RemindersDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dealershipId = (user as any)?.dealershipId as string | undefined;
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ id: string; sent: number; skipped: number; failed: number } | null>(null);

  const { data: remindersData, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => apiFetch<{ success: boolean; reminders: ServiceReminder[] }>('/api/reminders'),
    staleTime: 30_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['reminderStats'],
    queryFn: () => apiFetch<{ success: boolean; stats: ReminderStats }>('/api/reminders/stats'),
    staleTime: 60_000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['reminderHistory'],
    queryFn: () => apiFetch<{ success: boolean; history: SendHistoryRow[] }>('/api/reminders/send-history?limit=20'),
    staleTime: 30_000,
  });

  const stats = statsData?.stats;
  const reminders = remindersData?.reminders ?? [];
  const history = historyData?.history ?? [];

  const handleSendNow = async (id: string) => {
    setSendingId(id);
    setSendResult(null);
    try {
      const data = await apiFetch<{ success: boolean; sent: number; skipped: number; failed: number }>(
        `/api/reminders/${id}/send`,
        { method: 'POST' }
      );
      setSendResult({ id, ...data });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminderStats'] });
      queryClient.invalidateQueries({ queryKey: ['reminderHistory'] });
    } catch {
      // silent
    } finally {
      setSendingId(null);
    }
  };

  const handleDisable = async (id: string) => {
    await apiFetch(`/api/reminders/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  const statusColor = (status: string) => {
    if (status === 'delivered' || status === 'sent') return '#16a34a';
    if (status === 'failed') return '#dc2626';
    if (status === 'opted_out') return '#f59e0b';
    return '#6b7280';
  };

  const channelIcon = (channel: string) => {
    if (channel === 'push') return '🔔';
    if (channel === 'email') return '✉️';
    if (channel === 'sms') return '💬';
    return '📨';
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('reminder.title')}</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4, marginBottom: 0 }}>
            {t('reminder.subtitle') ?? 'Automate service reminders for your customers'}
          </p>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('reminder.create')}
          </button>
        )}
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: t('reminder.activeReminders') ?? 'Active Reminders', value: stats?.activeReminders ?? '—', color: '#033280' },
          { label: t('reminder.sendsThisMonth') ?? 'Sends This Month', value: stats?.sendsThisMonth ?? '—', color: '#0cb22c' },
          { label: t('reminder.deliveryRate') ?? 'Delivery Rate', value: stats ? `${stats.deliveryRate}%` : '—', color: '#7c3aed' },
          { label: t('reminder.optOutRate') ?? 'Opt-Out Rate', value: stats ? `${stats.optOutRate}%` : '—', color: '#f59e0b' },
        ].map((card) => (
          <div key={card.label} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && dealershipId && (
        <CreateReminderForm
          dealershipId={dealershipId}
          onSaved={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Send result toast */}
      {sendResult && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#166534' }}>
            Reminder sent — <strong>{sendResult.sent}</strong> delivered, <strong>{sendResult.skipped}</strong> skipped, <strong>{sendResult.failed}</strong> failed
          </div>
          <button onClick={() => setSendResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Reminders table */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)', fontWeight: 700, fontSize: 14, color: 'var(--text, #111)' }}>
          {t('reminder.reminders') ?? 'Reminders'}
        </div>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>
        ) : reminders.length === 0 ? (
          <div style={{ padding: '40px 32px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            {t('reminder.noReminders')}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                {['Name', 'Type', 'Trigger', 'Status', 'Last Sent', 'Sends', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <>
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border, #f0f0f0)', cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text, #111)' }}>{r.name}</td>
                    <td style={{ padding: '11px 14px', color: '#555' }}>{TEMPLATE_LABELS[r.templateType] ?? r.templateType}</td>
                    <td style={{ padding: '11px 14px', color: '#555' }}>{r.triggerType === 'date_based' ? t('reminder.dateBased') : t('reminder.eventBased')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: r.isActive ? '#f0fdf4' : '#f9fafb', color: r.isActive ? '#16a34a' : '#888' }}>
                        {r.isActive ? t('reminder.active') : t('reminder.disabled')}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>
                      {r.lastSentAt ? new Date(r.lastSentAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#555' }}>{r.sendCount}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSendNow(r.id)}
                          disabled={sendingId === r.id || !r.isActive}
                          style={{ fontSize: 11, padding: '4px 10px', background: sendingId === r.id ? '#e5e7eb' : '#033280', color: sendingId === r.id ? '#888' : '#fff', border: 'none', borderRadius: 5, cursor: sendingId === r.id || !r.isActive ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                        >
                          {sendingId === r.id ? '…' : t('reminder.sendNow')}
                        </button>
                        {r.isActive && (
                          <button
                            onClick={() => handleDisable(r.id)}
                            style={{ fontSize: 11, padding: '4px 10px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, cursor: 'pointer', color: '#888', fontFamily: 'inherit' }}
                          >
                            {t('reminder.disable') ?? 'Disable'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr key={r.id + '-expanded'} style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                      <td colSpan={7} style={{ padding: '14px 18px', borderTop: '1px solid var(--border, #e5e7eb)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: 12 }}>
                          <div><span style={{ color: '#888', fontWeight: 600 }}>Subject: </span><span style={{ color: 'var(--text, #333)' }}>{r.subject}</span></div>
                          <div><span style={{ color: '#888', fontWeight: 600 }}>Recipients: </span><span style={{ color: 'var(--text, #333)' }}>{JSON.stringify(r.recipientFilter)}</span></div>
                          <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#888', fontWeight: 600 }}>Message: </span><span style={{ color: 'var(--text, #333)', whiteSpace: 'pre-wrap' }}>{r.message}</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send history */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)', fontWeight: 700, fontSize: 14, color: 'var(--text, #111)' }}>
          {t('reminder.sendHistory')}
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>No sends recorded yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                {['Reminder', 'Customer', 'Channel', 'Status', 'Sent At'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} style={{ borderTop: '1px solid var(--border, #f0f0f0)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text, #333)' }}>{row.reminderName ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{row.customerName ?? '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11 }}>{channelIcon(row.channel)} {t(`reminder.${row.channel}`) ?? row.channel}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(row.status) }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>
                    {new Date(row.sentAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
