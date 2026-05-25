// client/src/pages/FiSession.tsx — Customer-facing AI F&I Presenter
// Public page (no auth required). Accessed via session link sent by dealer.
// Shows dealer branding, F&I product cards, AI chat interface.
// Fallback: static product cards when AI unavailable.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'wouter';

interface FiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  monthlyAddon?: string;
  category: string;
  features: string[];
}

interface FiSession {
  sessionId: string;
  customerName: string;
  unitInfo: {
    vin: string;
    year: number;
    manufacturer: string;
    model: string;
    salePrice?: string;
  };
  dealershipInfo: {
    name: string;
    primaryColor: string;
    logoUrl?: string;
  };
  financingDetails?: {
    lender: string;
    term: number;
    rate: string;
    monthlyPayment?: string;
  };
  products: FiProduct[];
  status: 'created' | 'active' | 'completed' | 'expired';
  acceptedProducts: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  gap: '🛡️',
  extended_warranty: '🔧',
  paint_protection: '✨',
  fabric_protection: '🪡',
  roadside: '🚗',
  tire_wheel: '🔄',
  key_replacement: '🔑',
  other: '📋',
};

export default function FiSession() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [session, setSession] = useState<FiSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Presentation mode: 'intro' | 'chat' | 'completed'
  const [mode, setMode] = useState<'intro' | 'chat' | 'completed'>('intro');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());
  const [aiUnavailable, setAiUnavailable] = useState(false);

  // Completing
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) { setError('Invalid session link.'); setLoading(false); return; }
    try {
      const res = await fetch(`/api/ai/fi-session/${sessionId}`);
      if (!res.ok) {
        if (res.status === 404) setError('This presentation link has expired or is invalid.');
        else setError('Unable to load presentation. Please try again.');
        return;
      }
      const data = await res.json();
      setSession(data.session);
      if (data.session.status === 'completed') {
        setCompleted(true);
        setMode('completed');
        setAcceptedIds(new Set(data.session.acceptedProducts || []));
      } else if (data.session.status === 'expired') {
        setError('This presentation link has expired. Please contact your dealer.');
      }
    } catch {
      setError('Unable to load presentation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { loadSession(); }, [loadSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const brandColor = session?.dealershipInfo.primaryColor || '#08235d';

  const startPresentation = async () => {
    if (!session) return;
    setMode('chat');

    // Greeting message from AI
    setAiTyping(true);
    try {
      const res = await fetch(`/api/ai/fi-session/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, I just arrived for my F&I presentation.',
          conversationHistory: [],
        }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        setMessages([{ role: 'assistant', content: data.response }]);
      } else {
        setAiUnavailable(true);
        setMessages([{
          role: 'assistant',
          content: `Hi ${session.customerName}! Welcome to your F&I product presentation from ${session.dealershipInfo.name}. I'm here to walk you through some valuable protection products for your ${session.unitInfo.year} ${session.unitInfo.manufacturer} ${session.unitInfo.model}. Review the products below and click Accept on any you'd like to add.`,
        }]);
      }
    } catch {
      setAiUnavailable(true);
      setMessages([{
        role: 'assistant',
        content: `Hi ${session.customerName}! Welcome to your F&I product presentation from ${session.dealershipInfo.name}. Review the products below and click Accept on any you'd like to add.`,
      }]);
    } finally {
      setAiTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !session || aiTyping) return;
    const userMsg = inputText.trim();
    setInputText('');

    const updatedHistory: ChatMessage[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedHistory);
    setAiTyping(true);

    if (aiUnavailable) {
      setTimeout(() => {
        setMessages(h => [...h, {
          role: 'assistant',
          content: 'Please use the Accept / Decline buttons on each product card to make your selections. When you\'re done, click "Complete Presentation" below.',
        }]);
        setAiTyping(false);
      }, 600);
      return;
    }

    try {
      const res = await fetch(`/api/ai/fi-session/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          conversationHistory: messages,
        }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        setMessages(h => [...h, { role: 'assistant', content: data.response }]);
      } else {
        setAiUnavailable(true);
        setMessages(h => [...h, {
          role: 'assistant',
          content: 'I\'m having trouble responding right now. Please use the Accept / Decline buttons below to make your selections.',
        }]);
      }
    } catch {
      setAiUnavailable(true);
      setMessages(h => [...h, {
        role: 'assistant',
        content: 'Connection issue. Please use the product cards below to make your selections.',
      }]);
    } finally {
      setAiTyping(false);
    }
  };

  const handleAccept = async (productId: string) => {
    setAcceptedIds(s => new Set([...s, productId]));
    setDeclinedIds(s => { const n = new Set(s); n.delete(productId); return n; });
    try {
      await fetch(`/api/ai/fi-session/${sessionId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch { /* non-critical */ }
  };

  const handleDecline = (productId: string) => {
    setDeclinedIds(s => new Set([...s, productId]));
    setAcceptedIds(s => { const n = new Set(s); n.delete(productId); return n; });
  };

  const handleComplete = async () => {
    if (!session) return;
    setCompleting(true);
    try {
      await fetch(`/api/ai/fi-session/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch { /* non-critical */ }
    setCompleted(true);
    setMode('completed');
    setCompleting(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15 }}>Loading your presentation…</div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Session Unavailable</div>
          <div style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{error || 'Invalid session.'}</div>
        </div>
      </div>
    );
  }

  // ── Completed screen ──────────────────────────────────────────────────────────
  if (mode === 'completed') {
    const accepted = session.products.filter(p => acceptedIds.has(p.id));
    const total = accepted.reduce((s, p) => s + parseFloat(p.price || '0'), 0);
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ background: brandColor, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {session.dealershipInfo.logoUrl && (
            <img src={session.dealershipInfo.logoUrl} alt="" style={{ height: 40, objectFit: 'contain' }} />
          )}
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{session.dealershipInfo.name}</div>
        </div>

        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>✓</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Presentation Complete</div>
          <div style={{ fontSize: 15, color: '#666', marginBottom: 32 }}>
            Thank you, {session.customerName}! Your selections have been saved.
          </div>

          {accepted.length > 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Products You Selected</div>
              {accepted.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{p.description.substring(0, 60)}…</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: brandColor }}>${parseFloat(p.price).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 15, fontWeight: 700 }}>
                <span>Total Added Protection</span>
                <span style={{ color: brandColor }}>${total.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, color: '#888', fontSize: 14 }}>
              No protection products were selected. Your dealer will follow up with you.
            </div>
          )}

          <div style={{ fontSize: 13, color: '#888' }}>
            Your {session.dealershipInfo.name} team will follow up to finalize your selections.
          </div>
        </div>
      </div>
    );
  }

  // ── Intro screen ──────────────────────────────────────────────────────────────
  if (mode === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e8f0fe 100%)', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: brandColor, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {session.dealershipInfo.logoUrl && (
            <img src={session.dealershipInfo.logoUrl} alt="" style={{ height: 40, objectFit: 'contain' }} />
          )}
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{session.dealershipInfo.name}</div>
          <div style={{ flex: 1 }} />
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>F&I Presentation</div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{
              width: 96, height: 96, borderRadius: '50%', margin: '0 auto 28px',
              background: `${brandColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
            }}>
              🎬
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8, lineHeight: 1.2 }}>
              Your F&I Presentation is Ready
            </div>
            <div style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.6 }}>
              Hi {session.customerName}! {session.dealershipInfo.name} has prepared a personalized protection product presentation for your new {session.unitInfo.year} {session.unitInfo.manufacturer} {session.unitInfo.model}.
            </div>

            {/* Unit card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 28, textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Your Unit</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {session.unitInfo.year} {session.unitInfo.manufacturer} {session.unitInfo.model}
              </div>
              <div style={{ fontSize: 13, color: '#888', fontFamily: 'monospace' }}>VIN: {session.unitInfo.vin}</div>
              {session.financingDetails && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#555' }}>
                  Financed through <strong>{session.financingDetails.lender}</strong> —{' '}
                  {session.financingDetails.term} months at {session.financingDetails.rate}%
                  {session.financingDetails.monthlyPayment && ` · $${session.financingDetails.monthlyPayment}/mo`}
                </div>
              )}
            </div>

            {/* Products count */}
            <div style={{ marginBottom: 28, fontSize: 14, color: '#64748b' }}>
              <strong style={{ color: '#1e293b' }}>{session.products.length} protection products</strong> available to review
            </div>

            <button
              onClick={startPresentation}
              style={{
                background: brandColor, color: '#fff', border: 'none', borderRadius: 12,
                padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 4px 20px ${brandColor}40`, transition: 'opacity 0.2s', width: '100%',
              }}
            >
              Start Presentation
            </button>

            <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
              Powered by Dealer Suite 360
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat / Presentation screen ────────────────────────────────────────────────
  const allResponded = session.products.every(p => acceptedIds.has(p.id) || declinedIds.has(p.id));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: brandColor, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        {session.dealershipInfo.logoUrl && (
          <img src={session.dealershipInfo.logoUrl} alt="" style={{ height: 32, objectFit: 'contain' }} />
        )}
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{session.dealershipInfo.name}</div>
        <div style={{ flex: 1 }} />
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
          {session.unitInfo.year} {session.unitInfo.manufacturer} {session.unitInfo.model}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1100, width: '100%', margin: '0 auto', padding: 20, gap: 20 }}>

        {/* Left: AI Chat */}
        <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: `${brandColor}08` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
              {aiUnavailable ? 'Product Advisor' : 'AI Product Advisor'}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{session.dealershipInfo.name}</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? brandColor : '#f1f5f9',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: 14, lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {aiTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: '#f1f5f9', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask a question or respond…"
              disabled={aiTyping}
              style={{
                flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 24,
                fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || aiTyping}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: inputText.trim() && !aiTyping ? brandColor : '#e2e8f0',
                color: '#fff', cursor: inputText.trim() && !aiTyping ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Products */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            Available Protection Products
          </div>

          {session.products.map(product => {
            const isAccepted = acceptedIds.has(product.id);
            const isDeclined = declinedIds.has(product.id);
            return (
              <div key={product.id} style={{
                background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: isAccepted ? `2px solid #22c55e` : isDeclined ? '2px solid #e2e8f0' : '2px solid transparent',
                opacity: isDeclined ? 0.65 : 1,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{CATEGORY_ICONS[product.category] || '📋'}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{product.name}</div>
                      <div style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>{product.category.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: brandColor }}>
                      ${parseFloat(product.price).toLocaleString()}
                    </div>
                    {product.monthlyAddon && (
                      <div style={{ fontSize: 11, color: '#888' }}>+${product.monthlyAddon}/mo</div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5, marginBottom: 12 }}>
                  {product.description}
                </div>

                {product.features.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {product.features.map((f, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                        background: `${brandColor}12`, color: brandColor,
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAccept(product.id)}
                    style={{
                      flex: 1, padding: '10px', border: 'none', borderRadius: 10,
                      background: isAccepted ? '#22c55e' : '#f0fdf4',
                      color: isAccepted ? '#fff' : '#16a34a',
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: isAccepted ? `2px solid #22c55e` : 'none',
                    }}
                  >
                    {isAccepted ? '✓ Accepted' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleDecline(product.id)}
                    style={{
                      flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 10,
                      background: isDeclined ? '#f1f5f9' : '#fff',
                      color: '#64748b',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isDeclined ? 'Declined' : 'No Thanks'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Summary + Complete */}
          {(allResponded || acceptedIds.size > 0) && (
            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
                Your Summary
              </div>
              {acceptedIds.size > 0 ? (
                <>
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
                    <strong style={{ color: '#22c55e' }}>{acceptedIds.size} product{acceptedIds.size > 1 ? 's' : ''}</strong> selected
                  </div>
                  {session.products.filter(p => acceptedIds.has(p.id)).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#555' }}>
                      <span>{p.name}</span>
                      <strong>${parseFloat(p.price).toLocaleString()}</strong>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                    <span>Total</span>
                    <span style={{ color: brandColor }}>
                      ${session.products.filter(p => acceptedIds.has(p.id)).reduce((s, p) => s + parseFloat(p.price || '0'), 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: '#888' }}>No products selected.</div>
              )}

              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  width: '100%', marginTop: 16, padding: '14px', border: 'none', borderRadius: 12,
                  background: brandColor, color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: completing ? 'wait' : 'pointer',
                  boxShadow: `0 4px 16px ${brandColor}30`,
                }}
              >
                {completing ? 'Completing…' : 'Complete Presentation'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
