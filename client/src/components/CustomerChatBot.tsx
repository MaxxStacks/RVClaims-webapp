// client/src/components/CustomerChatBot.tsx — AI Customer Support Bot floating widget

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { Link } from 'wouter';

interface ChatMessage {
  role: 'customer' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: { type: string; [key: string]: unknown }[] | null;
}

interface Props {
  dealershipId: string;
  dealerName: string;
  greetingMessage?: string;
}

export default function CustomerChatBot({ dealershipId, dealerName, greetingMessage }: Props) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const greeting = greetingMessage ?? t('aiSupport.greeting');

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
      // Show greeting on first open
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
          actions: null,
        }]);
      }
    }
  };

  const handleClose = () => setIsOpen(false);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    // Add customer message
    const customerMsg: ChatMessage = { role: 'customer', content: text, timestamp: new Date(), actions: null };
    setMessages(prev => [...prev, customerMsg]);

    try {
      const data = await apiFetch<{
        success: boolean;
        response: string;
        conversationId: string;
        actions?: { type: string }[] | null;
      }>('/api/ai/customer-chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, conversationId, dealershipId }),
      });

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.actions ?? null,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('aiSupport.error'),
        timestamp: new Date(),
        actions: [{ type: 'suggest_ticket' }],
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, conversationId, dealershipId, t]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // ── Collapsed bubble ──
  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9990,
        }}
      >
        <button
          onClick={handleOpen}
          title={t('aiSupport.title')}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#033280',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(3,50,128,0.35)',
            position: 'relative',
            animation: !hasOpenedOnce ? 'ds360-pulse 2.5s infinite' : 'none',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </button>
        <style>{`
          @keyframes ds360-pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(3,50,128,0.35), 0 0 0 0 rgba(3,50,128,0.4); }
            50% { box-shadow: 0 4px 20px rgba(3,50,128,0.35), 0 0 0 8px rgba(3,50,128,0); }
          }
        `}</style>
      </div>
    );
  }

  // ── Expanded panel ──
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9991,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card, #fff)',
      }
    : {
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 340,
        height: 500,
        zIndex: 9991,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card, #fff)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        border: '1px solid var(--border, #e8e8e8)',
        overflow: 'hidden',
      };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        background: '#033280',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {dealerName} {t('aiSupport.title')}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
              {t('aiSupport.online') ?? 'Online'}
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,0.8)', display: 'flex' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div style={{
              display: 'flex',
              justifyContent: msg.role === 'customer' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '9px 13px',
                borderRadius: msg.role === 'customer' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'customer' ? '#033280' : 'var(--bg-secondary, #f4f6fb)',
                color: msg.role === 'customer' ? '#fff' : 'var(--text, #222)',
                fontSize: 13,
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}>
                {msg.content}
              </div>
            </div>
            {/* Action buttons */}
            {msg.actions?.some(a => a.type === 'suggest_ticket') && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 6 }}>
                <Link
                  to="tickets/new"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#033280',
                    background: '#f0f5ff',
                    border: '1px solid #c7d4f0',
                    borderRadius: 8,
                    padding: '6px 12px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  {t('aiSupport.createTicket')}
                </Link>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '9px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: 'var(--bg-secondary, #f4f6fb)',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#aaa',
                  display: 'inline-block',
                  animation: `ds360-bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
              <style>{`
                @keyframes ds360-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
                }
              `}</style>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div style={{
        borderTop: '1px solid var(--border, #e8e8e8)',
        padding: '10px 12px',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        flexShrink: 0,
        background: 'var(--bg-card, #fff)',
      }}>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('aiSupport.placeholder')}
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--border, #e0e0e0)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            lineHeight: 1.5,
            maxHeight: 72,
            overflowY: 'auto',
            background: 'var(--bg-secondary, #f9fafb)',
            color: 'var(--text, #222)',
            opacity: isLoading ? 0.6 : 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          title={t('aiSupport.send')}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: inputValue.trim() && !isLoading ? '#033280' : '#e0e0e0',
            border: 'none',
            cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
