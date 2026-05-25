import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

// Client-side Messages page: inbox view of quick-chat conversations
// Renders the full chat thread with the dealer as a two-panel inbox UI

export default function Messages() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [dealership, setDealership] = useState<any>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadMessages = useCallback(async () => {
    if (!user?.dealershipId || !user?.id) return;
    try {
      const data = await apiFetch<any>(`/api/quick-chat/${user.dealershipId}/${user.id}`);
      setMessages(Array.isArray(data) ? data : data.messages || []);
      setDataError(null);
    } catch (err: any) {
      setDataError(err?.message || 'Unable to load messages');
    }
  }, [user?.dealershipId, user?.id]);

  useEffect(() => {
    if (user?.dealershipId) {
      apiFetch<any>(`/api/v6/dealerships/${user.dealershipId}`)
        .then(d => setDealership(d.dealership || d))
        .catch(() => {});
    }
  }, [user?.dealershipId]);

  useEffect(() => {
    loadMessages();
    intervalRef.current = setInterval(loadMessages, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!user?.dealershipId || !user?.id) { showToast('Session error'); return; }
    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      await apiFetch('/api/quick-chat', {
        method: 'POST',
        body: JSON.stringify({ dealershipId: user.dealershipId, customerId: user.id, message: msgText }),
      });
      await loadMessages();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send message');
      setNewMessage(msgText);
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg: any) => msg.senderId === user?.id;
  const dealerName = dealership?.name || 'Your Dealer';
  const dealerInitials = dealerName.slice(0, 2).toUpperCase();

  // Fake "inbox" sidebar — just one conversation thread (dealer)
  const unreadCount = messages.filter(m => !isMyMessage(m)).length;

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 560}}>
        {/* Conversation list sidebar */}
        <div className="pn" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 13}}>Inbox</div>
          <div style={{padding: '12px 16px', borderBottom: '1px solid #f8f8f8', cursor: 'default', background: '#f0f4ff', display: 'flex', gap: 10}}>
            <div style={{width: 36, height: 36, borderRadius: '50%', background: '#08235d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0}}>{dealerInitials}</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontWeight: 600, fontSize: 13, marginBottom: 2}}>{dealerName}</div>
              <div style={{fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {messages.length > 0 ? messages[messages.length - 1].message : 'Start a conversation'}
              </div>
              {messages.length > 0 && (
                <div style={{fontSize: 11, color: '#aaa', marginTop: 2}}>
                  {new Date(messages[messages.length - 1].createdAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'})}
                </div>
              )}
            </div>
            {unreadCount > 0 && <div style={{width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 4}}></div>}
          </div>
        </div>

        {/* Thread panel */}
        <div className="pn" style={{display: 'flex', flexDirection: 'column', padding: 0}}>
          <div style={{padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 14}}>{dealerName}</div>

          <div style={{flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10}}>
            {dataError && <div style={{textAlign: 'center', color: '#e53e3e', fontSize: 13}}>{dataError}</div>}
            {!dataError && messages.length === 0 && (
              <div style={{textAlign: 'center', color: '#888', fontSize: 13, paddingTop: 40}}>No messages yet. Say hello!</div>
            )}
            {messages.map((msg: any) => {
              const mine = isMyMessage(msg);
              return (
                <div key={msg.id} style={{display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end'}}>
                  <div style={{
                    background: mine ? '#08235d' : '#f0f4ff',
                    color: mine ? '#fff' : '#1a1a1a',
                    borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '12px 16px',
                    maxWidth: '75%',
                    fontSize: 13,
                    lineHeight: '1.5',
                  }}>
                    {msg.message}
                  </div>
                  <div style={{fontSize: 11, color: '#aaa', whiteSpace: 'nowrap'}}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-CA', {hour: '2-digit', minute: '2-digit'})}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8}}>
            <input
              placeholder={`Reply to ${dealerName}...`}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              style={{flex: 1, padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: 20, fontSize: 13, fontFamily: 'inherit', outline: 'none'}}
            />
            <button className="btn btn-p" style={{borderRadius: 20}} onClick={handleSend} disabled={sending || !newMessage.trim()}>
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
