import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Helper: extract upsell opportunity ID from linkTo like "/notifications?upsell=<id>"
function getUpsellId(linkTo?: string | null): string | null {
  if (!linkTo) return null;
  try {
    const url = new URL(linkTo, window.location.origin);
    return url.searchParams.get('upsell');
  } catch {
    return null;
  }
}

export default function Notifications() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const isOpAdmin = user?.role === 'operator_admin';
  const [upsellResponding, setUpsellResponding] = useState<Record<string, boolean>>({});

  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [notifSending, setNotifSending] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notifForm, setNotifForm] = useState({
    recipients: 'all', type: 'general', title: '', message: '',
    priority: 'normal', delivery: 'push', schedule: 'immediate',
  });

  const [inbox, setInbox] = useState<any[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (isOpAdmin) {
      apiFetch<any>('/api/v6/dealerships?limit=200')
        .then(d => setOpDealers(Array.isArray(d) ? d : (d?.dealerships ?? [])))
        .catch(() => {});
    }
    apiFetch<any>('/api/notifications')
      .then(d => setInbox(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {})
      .finally(() => setInboxLoading(false));
  }, [isOpAdmin]);

  const handleSend = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setNotifSending(true);
    try {
      await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify(notifForm) });
      setNotifForm({ recipients: 'all', type: 'general', title: '', message: '', priority: 'normal', delivery: 'push', schedule: 'immediate' });
      setNotifSent(true);
      setTimeout(() => setNotifSent(false), 3000);
    } catch {} finally { setNotifSending(false); }
  };

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setInbox(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT' });
      setInbox(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {} finally { setMarkingAll(false); }
  };

  const respondToUpsell = async (notifId: string, upsellId: string, response: 'accepted' | 'declined') => {
    setUpsellResponding(prev => ({ ...prev, [upsellId]: true }));
    try {
      await apiFetch(`/api/upsell/opportunities/${upsellId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      });
      await markRead(notifId);
      toast({ title: response === 'accepted' ? 'Offer accepted!' : 'Offer declined.' });
      // Refresh inbox
      const d = await apiFetch<any>('/api/notifications');
      setInbox(Array.isArray(d.notifications) ? d.notifications : []);
    } catch {
      toast({ title: 'Failed to respond. Please try again.' });
    } finally {
      setUpsellResponding(prev => ({ ...prev, [upsellId]: false }));
    }
  };

  const displayed = filter === 'unread' ? inbox.filter(n => !n.isRead) : inbox;
  const unreadCount = inbox.filter(n => !n.isRead).length;

  const InboxPanel = () => (
    <div className="pn">
      <div className="pn-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="pn-t">
          {t('notifications.inbox')}
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8, background: '#033280', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 7px', fontWeight: 600, verticalAlign: 'middle' }}>{unreadCount}</span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'unread')}
            style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}>
            <option value="all">All</option>
            <option value="unread">{t('notifications.unreadOnly')}</option>
          </select>
          {unreadCount > 0 && (
            <button className="btn btn-o btn-sm" onClick={markAllRead} disabled={markingAll}>
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>
      {inboxLoading && <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>Loading…</div>}
      {!inboxLoading && displayed.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
        </div>
      )}
      {!inboxLoading && displayed.map(n => {
        const upsellId = getUpsellId(n.linkTo);
        const isUpsellOffer = !!upsellId;
        const isResponding = upsellId ? !!upsellResponding[upsellId] : false;

        return (
          <div
            key={n.id}
            style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: n.isRead ? 'transparent' : '#f0f5ff', cursor: isUpsellOffer ? 'default' : n.linkTo ? 'pointer' : 'default', display: 'flex', gap: 12, alignItems: 'flex-start' }}
            onClick={!isUpsellOffer ? () => { if (!n.isRead) markRead(n.id); if (n.linkTo) window.location.href = n.linkTo; } : undefined}
          >
            {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: isUpsellOffer ? '#0cb22c' : '#033280', marginTop: 5, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: '#222', marginBottom: 3 }}>{n.title}</div>
              {n.message && <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{n.message}</div>}
              {isUpsellOffer && !n.isRead && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => respondToUpsell(n.id, upsellId!, 'accepted')}
                    disabled={isResponding}
                    style={{ background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: isResponding ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                  >
                    {t('upsell.acceptOffer')}
                  </button>
                  <button
                    onClick={() => respondToUpsell(n.id, upsellId!, 'declined')}
                    disabled={isResponding}
                    style={{ background: 'none', color: '#888', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: isResponding ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                  >
                    {t('upsell.declineOffer')}
                  </button>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>{fmtDate(n.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (!isOpAdmin) {
    return (
      <div className="page active">
        <InboxPanel />
      </div>
    );
  }

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">{t('notifications.composeNotification')}</span></div>
          <div className="form-grid">
            <div className="form-group full"><label>{t('notifications.recipients')}</label>
              <select value={notifForm.recipients} onChange={e => setNotifForm(f => ({...f, recipients: e.target.value}))}>
                <option value="all">All Dealers</option>
                <option value="active">All Active Dealers</option>
                <option value="plan_a">Plan A Dealers</option>
                <option value="plan_b">Plan B Dealers</option>
                {opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group full"><label>{t('common.type')}</label>
              <select value={notifForm.type} onChange={e => setNotifForm(f => ({...f, type: e.target.value}))}>
                <option value="general">General Announcement</option>
                <option value="service">Service Update</option>
                <option value="billing">Billing Reminder</option>
                <option value="feature">New Feature</option>
                <option value="maintenance">Maintenance Notice</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>
            <div className="form-group full"><label>{t('notifications.title')}</label>
              <input placeholder="Notification title..." value={notifForm.title} onChange={e => setNotifForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div className="form-group full"><label>{t('notifications.message')}</label>
              <textarea placeholder="Write your message..." style={{minHeight: 120}} value={notifForm.message} onChange={e => setNotifForm(f => ({...f, message: e.target.value}))} />
            </div>
            <div className="form-group"><label>{t('notifications.priority')}</label>
              <select value={notifForm.priority} onChange={e => setNotifForm(f => ({...f, priority: e.target.value}))}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group"><label>{t('notifications.delivery')}</label>
              <select value={notifForm.delivery} onChange={e => setNotifForm(f => ({...f, delivery: e.target.value}))}>
                <option value="push">Push to Dashboard</option>
                <option value="push_email">Push + Email</option>
                <option value="email">Email Only</option>
              </select>
            </div>
            <div className="form-group full"><label>{t('notifications.schedule')}</label>
              <select value={notifForm.schedule} onChange={e => setNotifForm(f => ({...f, schedule: e.target.value}))}>
                <option value="immediate">Send Immediately</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSend} disabled={notifSending || !notifForm.title || !notifForm.message}>
              {notifSending ? t('common.saving') : t('notifications.sendNotification')}
            </button>
            {notifSent && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>✓ Sent successfully</span>}
          </div>
        </div>
        <InboxPanel />
      </div>
    </div>
  );
}
