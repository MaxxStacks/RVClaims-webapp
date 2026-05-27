// client/src/pages/exclusive/dealer-owner/AISupportConfig.tsx
// Route: /:dealerId/owner/ai-support

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AiConfig {
  id: string;
  isActive: boolean;
  greetingMessage: string;
}

interface AiFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

interface AiConversation {
  id: string;
  customerId: string;
  messageCount: number;
  lastMessageAt: string | null;
  status: string;
  createdAt: string;
}

interface AiMessage {
  id: string;
  role: 'customer' | 'assistant';
  content: string;
  createdAt: string;
}

interface AiStats {
  conversationsToday: number;
  conversationsThisWeek: number;
  conversationsThisMonth: number;
  escalations: number;
}

export default function AISupportConfig() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const dealershipId = user?.dealershipId as string | undefined;

  // Config state
  const [isActive, setIsActive] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState(
    "Hi! I can help with questions about your warranty, claims, and service. How can I help?"
  );
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // FAQ state
  const [addingFaq, setAddingFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Conversation log state
  const [convFilter, setConvFilter] = useState<'today' | 'week' | 'all'>('week');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  // Load config
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['ai-support-dealer-config', dealershipId],
    queryFn: () => apiFetch<{ success: boolean; config: AiConfig | null; faqs: AiFaq[] }>('/api/ai/customer-chat/dealer-config'),
    enabled: !!dealershipId,
    staleTime: 30000,
  });

  // Load stats
  const { data: statsData } = useQuery({
    queryKey: ['ai-support-stats', dealershipId],
    queryFn: () => apiFetch<{ success: boolean; stats: AiStats }>('/api/ai/customer-chat/stats'),
    enabled: !!dealershipId,
    staleTime: 30000,
  });

  // Load conversations
  const { data: convsData } = useQuery({
    queryKey: ['ai-support-conversations', dealershipId, convFilter],
    queryFn: () => apiFetch<{ success: boolean; conversations: AiConversation[] }>(
      `/api/ai/customer-chat/conversations?filter=${convFilter}`
    ),
    enabled: !!dealershipId,
    staleTime: 30000,
  });

  // Load selected conversation messages
  const { data: convMsgsData } = useQuery({
    queryKey: ['ai-support-conv-messages', selectedConvId],
    queryFn: () => apiFetch<{ success: boolean; messages: AiMessage[] }>(
      `/api/ai/customer-chat/conversations/${selectedConvId}/messages`
    ),
    enabled: !!selectedConvId,
    staleTime: 15000,
  });

  // Sync config to state
  useEffect(() => {
    if (configData?.config) {
      setIsActive(configData.config.isActive);
      setGreetingMessage(configData.config.greetingMessage);
    }
  }, [configData]);

  const faqs = configData?.faqs ?? [];
  const convs = convsData?.conversations ?? [];
  const stats = statsData?.stats;
  const convMessages = convMsgsData?.messages ?? [];

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await apiFetch('/api/ai/customer-chat/dealer-config', {
        method: 'PUT',
        body: JSON.stringify({ isActive, greetingMessage }),
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
      qc.invalidateQueries({ queryKey: ['ai-support-dealer-config'] });
      qc.invalidateQueries({ queryKey: ['ai-support-config'] });
    } catch {}
    setConfigSaving(false);
  };

  const addFaq = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    try {
      await apiFetch('/api/ai/customer-chat/faqs', {
        method: 'POST',
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim(), sortOrder: faqs.length }),
      });
      setNewQuestion('');
      setNewAnswer('');
      setAddingFaq(false);
      qc.invalidateQueries({ queryKey: ['ai-support-dealer-config'] });
    } catch {}
  };

  const saveFaq = async (faqId: string) => {
    try {
      await apiFetch(`/api/ai/customer-chat/faqs/${faqId}`, {
        method: 'PUT',
        body: JSON.stringify({ question: editQuestion, answer: editAnswer }),
      });
      setEditingFaqId(null);
      qc.invalidateQueries({ queryKey: ['ai-support-dealer-config'] });
    } catch {}
  };

  const deleteFaq = async (faqId: string) => {
    try {
      await apiFetch(`/api/ai/customer-chat/faqs/${faqId}`, { method: 'DELETE' });
      qc.invalidateQueries({ queryKey: ['ai-support-dealer-config'] });
    } catch {}
  };

  const toggleFaqActive = async (faq: AiFaq) => {
    try {
      await apiFetch(`/api/ai/customer-chat/faqs/${faq.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !faq.isActive }),
      });
      qc.invalidateQueries({ queryKey: ['ai-support-dealer-config'] });
    } catch {}
  };

  const escalateConversation = async (convId: string) => {
    try {
      await apiFetch(`/api/ai/customer-chat/${convId}/escalate`, { method: 'POST' });
      qc.invalidateQueries({ queryKey: ['ai-support-conversations'] });
    } catch {}
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card, #fff)',
    border: '1px solid var(--border, #e8e8e8)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted, #666)',
    marginBottom: 6,
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--border, #e0e0e0)',
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--text, #222)',
    background: 'var(--bg-secondary, #f9fafb)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>
          {t('aiSupport.config')}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #666)', marginTop: 4 }}>
          {t('aiSupport.configDesc') ?? 'Configure the AI support bot for your customer portal. The bot answers questions using your customers’ real data.'}
        </p>
      </div>

      {/* ── Section 1: Bot Settings ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text, #111)' }}>
          Bot Settings
        </h2>

        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #222)' }}>Enable AI Support Bot</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #888)', marginTop: 2 }}>
              Show the chat widget to customers in their portal
            </div>
          </div>
          <button
            onClick={() => setIsActive(v => !v)}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: isActive ? '#0cb22c' : '#d1d5db',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: isActive ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Greeting message */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Greeting Message</label>
          <textarea
            value={greetingMessage}
            onChange={e => setGreetingMessage(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
            This is the first message customers see when they open the chat widget.
          </div>
        </div>

        {/* Embed snippet */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            {t('aiSupport.embedSnippet')}
            <span style={{ marginLeft: 6, background: '#f97316', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 4, fontWeight: 700, verticalAlign: 'middle' }}>
              {t('aiSupport.comingSoon') ?? 'Coming Soon'}
            </span>
          </label>
          <div style={{
            background: 'var(--bg-secondary, #f4f6fb)',
            border: '1px solid var(--border, #e0e0e0)',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#888',
            wordBreak: 'break-all',
          }}>
            {`<script src="https://dealersuite360.com/widget.js" data-dealer="${dealershipId}"></script>`}
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
            Embed the bot on your dealership website — functionality coming in a future update.
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={configSaving}
          style={{
            background: configSaved ? '#0cb22c' : '#033280',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '9px 24px', fontSize: 13, fontWeight: 600,
            cursor: configSaving ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {configSaving ? t('common.saving') : configSaved ? 'Saved!' : t('common.save')}
        </button>
      </div>

      {/* ── Section 2: FAQ Overrides ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text, #111)' }}>
              {t('aiSupport.faqs')}
            </h2>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
              FAQs are checked first — the bot answers from these before using AI. No AI cost for FAQ matches.
            </div>
          </div>
          <button
            onClick={() => setAddingFaq(true)}
            style={{
              background: '#033280', color: '#fff', border: 'none', borderRadius: 7,
              padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            + {t('aiSupport.addFaq')}
          </button>
        </div>

        {/* Add FAQ form */}
        {addingFaq && (
          <div style={{ background: '#f0f5ff', borderRadius: 8, padding: 14, marginBottom: 12, border: '1px solid #c7d4f0' }}>
            <div style={{ marginBottom: 8 }}>
              <label style={labelStyle}>Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="e.g. What does my warranty cover?"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Answer</label>
              <textarea
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                rows={3}
                placeholder="Enter the answer to show customers..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={addFaq}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                style={{
                  background: '#033280', color: '#fff', border: 'none', borderRadius: 7,
                  padding: '7px 16px', fontSize: 12, fontWeight: 600,
                  cursor: !newQuestion.trim() || !newAnswer.trim() ? 'default' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => { setAddingFaq(false); setNewQuestion(''); setNewAnswer(''); }}
                style={{
                  background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 7,
                  padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  color: 'var(--text-muted, #666)',
                }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {faqs.length === 0 && !addingFaq && (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: '24px 0' }}>
            No FAQs yet. Add your first FAQ to reduce AI calls and improve response speed.
          </div>
        )}

        {faqs.map((faq) => (
          <div key={faq.id} style={{
            border: '1px solid var(--border, #e8e8e8)',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 8,
            background: faq.isActive ? 'transparent' : 'var(--bg-secondary, #f9fafb)',
          }}>
            {editingFaqId === faq.id ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={e => setEditQuestion(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <textarea
                    value={editAnswer}
                    onChange={e => setEditAnswer(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveFaq(faq.id)} style={{ background: '#033280', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t('common.save')}
                  </button>
                  <button onClick={() => setEditingFaqId(null)} style={{ background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted, #666)' }}>
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: faq.isActive ? 'var(--text, #222)' : '#aaa', marginBottom: 4 }}>
                      Q: {faq.question}
                    </div>
                    <div style={{ fontSize: 12, color: faq.isActive ? 'var(--text-muted, #555)' : '#ccc', lineHeight: 1.5 }}>
                      A: {faq.answer}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleFaqActive(faq)}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
                        background: faq.isActive ? '#dcfce7' : '#f3f4f6',
                        color: faq.isActive ? '#16a34a' : '#6b7280', fontWeight: 600, fontFamily: 'inherit',
                      }}
                    >
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => { setEditingFaqId(faq.id); setEditQuestion(faq.question); setEditAnswer(faq.answer); }}
                      style={{ background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#033280', fontFamily: 'inherit' }}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Section 3: Conversation Log ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text, #111)' }}>
            {t('aiSupport.conversations')}
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['today', 'week', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setConvFilter(f); setSelectedConvId(null); }}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                  background: convFilter === f ? '#033280' : 'transparent',
                  color: convFilter === f ? '#fff' : 'var(--text-muted, #666)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {convs.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: '24px 0' }}>
            No conversations in this period.
          </div>
        )}

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Conversation list */}
          <div style={{ flex: 1, maxHeight: 380, overflowY: 'auto' }}>
            {convs.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id === selectedConvId ? null : conv.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 6,
                  cursor: 'pointer',
                  background: selectedConvId === conv.id ? '#f0f5ff' : 'var(--bg-secondary, #f9fafb)',
                  border: `1px solid ${selectedConvId === conv.id ? '#c7d4f0' : 'var(--border, #e8e8e8)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text, #222)', marginBottom: 2 }}>
                    Customer #{conv.customerId.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {conv.messageCount} messages
                    {conv.lastMessageAt
                      ? ` · ${new Date(conv.lastMessageAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                      : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600,
                    background: conv.status === 'escalated' ? '#fef2f2' : conv.status === 'closed' ? '#f3f4f6' : '#f0fdf4',
                    color: conv.status === 'escalated' ? '#dc2626' : conv.status === 'closed' ? '#6b7280' : '#16a34a',
                  }}>
                    {conv.status}
                  </span>
                  {conv.status !== 'escalated' && (
                    <button
                      onClick={e => { e.stopPropagation(); escalateConversation(conv.id); }}
                      style={{ fontSize: 10, background: 'none', border: '1px solid #e0e0e0', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', color: '#888', fontFamily: 'inherit' }}
                    >
                      {t('aiSupport.escalate')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Conversation thread */}
          {selectedConvId && (
            <div style={{
              width: 320,
              flexShrink: 0,
              background: 'var(--bg-secondary, #f9fafb)',
              borderRadius: 8,
              border: '1px solid var(--border, #e8e8e8)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 380,
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border, #e8e8e8)', fontSize: 12, fontWeight: 600, color: 'var(--text, #222)' }}>
                Conversation Thread
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {convMessages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'customer' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '7px 11px',
                      borderRadius: 10,
                      fontSize: 12,
                      lineHeight: 1.5,
                      background: msg.role === 'customer' ? '#033280' : '#fff',
                      color: msg.role === 'customer' ? '#fff' : 'var(--text, #222)',
                      border: msg.role === 'assistant' ? '1px solid var(--border, #e8e8e8)' : 'none',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4: Stats ── */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text, #111)' }}>
          {t('aiSupport.stats')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Conversations Today', value: stats?.conversationsToday ?? 0 },
            { label: 'This Week', value: stats?.conversationsThisWeek ?? 0 },
            { label: 'This Month', value: stats?.conversationsThisMonth ?? 0 },
            { label: 'Escalations', value: stats?.escalations ?? 0, warn: true },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-secondary, #f4f6fb)',
              borderRadius: 10,
              padding: '14px 16px',
              border: '1px solid var(--border, #e8e8e8)',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.warn && s.value > 0 ? '#dc2626' : '#033280' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
