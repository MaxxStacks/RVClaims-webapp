import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function QuickChat() {
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

  // Load dealership info
  useEffect(() => {
    if (user?.dealershipId) {
      apiFetch<any>(`/api/dealerships/${user.dealershipId}`)
        .then(d => setDealership(d.dealership || d))
        .catch(() => {});
    }
  }, [user?.dealershipId]);

  // Initial load + 30-second polling
  useEffect(() => {
    loadMessages();
    intervalRef.current = setInterval(loadMessages, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!user?.dealershipId || !user?.id) { showToast('Session error'); return; }
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');
    try {
      await apiFetch('/api/quick-chat', {
        method: 'POST',
        body: JSON.stringify({
          dealershipId: user.dealershipId,
          customerId: user.id,
          message: msgText,
        }),
      });
      await loadMessages();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send message');
      setNewMessage(msgText); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMyMessage = (msg: any) => msg.senderId === user?.id;
  const dealershipName = dealership?.name || 'Your Dealer';

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div className="pn" style={{display: 'flex', flexDirection: 'column'}}>
          <div className="pn-h">
            <span className="pn-t">Quick Chat with {dealershipName}</span>
            <span style={{fontSize: 12, color: '#888'}}>For quick questions that don't need a ticket</span>
          </div>

          {/* Message thread */}
          <div
            className="comm-box"
            style={{margin: 0, border: 'none', borderRadius: 0, maxHeight: 400, overflowY: 'auto', flex: 1}}
          >
            {dataError && (
              <div style={{padding: 16, color: '#e53e3e', fontSize: 13, textAlign: 'center'}}>{dataError}</div>
            )}
            {!dataError && messages.length === 0 && (
              <div className="comm-msg">
                <div className="comm-avatar dl" style={{background: '#033280', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, width: 32, height: 32, borderRadius: '50%', flexShrink: 0}}>
                  {dealershipName.slice(0, 2).toUpperCase()}
                </div>
                <div className="comm-content">
                  <div className="comm-name">{dealershipName}</div>
                  <div className="comm-text">
                    Hey! Feel free to drop any quick questions here. For anything that needs tracking (claims, parts, billing), use Support Tickets instead.
                  </div>
                  <div className="comm-time">Just now</div>
                </div>
              </div>
            )}
            {messages.map((msg: any) => {
              const mine = isMyMessage(msg);
              return (
                <div key={msg.id} className="comm-msg" style={{flexDirection: mine ? 'row-reverse' : 'row'}}>
                  <div
                    className="comm-avatar"
                    style={{background: mine ? '#6b7280' : '#033280', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, width: 32, height: 32, borderRadius: '50%', flexShrink: 0}}
                  >
                    {mine ? (user?.firstName?.[0] || 'M') : dealershipName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="comm-content" style={{alignItems: mine ? 'flex-end' : 'flex-start'}}>
                    <div className="comm-name">{mine ? 'You' : dealershipName}</div>
                    <div className="comm-text" style={{
                      background: mine ? '#033280' : '#f0f4ff',
                      color: mine ? '#fff' : '#1a1a1a',
                      borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px',
                      maxWidth: '80%',
                    }}>
                      {msg.message}
                    </div>
                    <div className="comm-time">
                      {new Date(msg.createdAt).toLocaleString('en-CA', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
            <textarea
              placeholder="Type a quick message... (Enter to send, Shift+Enter for new line)"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, maxHeight: 120, resize: 'vertical', outline: 'none', boxSizing: 'border-box'}}
            />
            <div style={{textAlign: 'right', marginTop: 8}}>
              <button className="btn btn-p btn-sm" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16}}>
            <div style={{fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 8}}>Need to track something?</div>
            <div style={{fontSize: 12, color: '#3b82f6', lineHeight: '1.5', marginBottom: 12}}>
              Quick Chat is for simple questions. For claims, parts, billing, or anything that needs a status, create a Support Ticket instead.
            </div>
            <button
              className="btn btn-o btn-sm"
              style={{width: '100%', justifyContent: 'center', borderColor: '#93c5fd', color: '#2563eb'}}
              onClick={() => navigate('../tickets/new')}
            >
              Create Support Ticket
            </button>
          </div>

          {dealership && (
            <div className="cd-section" style={{marginTop: 16}}>
              <div className="cd-section-h">Dealer Info</div>
              <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">{dealership.name}</span></div>
              {dealership.phone && <div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">{dealership.phone}</span></div>}
              {dealership.email && <div className="cd-row"><span className="cd-label">Email</span><span className="cd-value">{dealership.email}</span></div>}
              {dealership.city && <div className="cd-row"><span className="cd-label">City</span><span className="cd-value">{dealership.city}</span></div>}
            </div>
          )}

          <div className="cd-section" style={{marginTop: 16}}>
            <div className="cd-section-h">Tip</div>
            <div style={{fontSize: 12, color: '#666', lineHeight: '1.6', padding: '0 0 8px'}}>
              Messages are refreshed every 30 seconds. For urgent matters, call your dealer directly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
