import React, { useState, useEffect, useRef } from 'react';
import { aiService, type AIAssistantMessage } from '../services/ai.service';
import { Sparkles, Send, Trash2, Bot, User as UserIcon, ShieldAlert, PhoneCall, AlertTriangle } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIAssistantMessage[]>([
    {
      sender: 'AI',
      message: "Hello, I am your SafeHer AI Safety Assistant. I'm here 24/7 to provide safety advice, emergency de-escalation strategies, travel guidance, and security tips. How can I support your safety right now?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What should I do if someone is following me?",
    "I feel unsafe while travelling alone at night.",
    "Someone is threatening me online.",
    "What are essential precautions for solo rides / cabs?",
    "How do I de-escalate an uncomfortable situation?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIAssistantMessage = {
      sender: 'USER',
      message: query.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await aiService.chat(query.trim(), conversationId);
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
      const aiMsg: AIAssistantMessage = {
        sender: 'AI',
        message: response.response,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: AIAssistantMessage = {
        sender: 'SYSTEM',
        message: "Unable to reach the AI engine right now. If you are in immediate danger, please call National Emergency (112) or Women Helpline (181).",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'AI',
        message: "Conversation cleared. How can I assist you with your personal safety today?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setConversationId(undefined);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.65rem', borderRadius: '14px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              AI Safety Assistant
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Real-time advice & security precautions
            </p>
          </div>
        </div>

        <button 
          onClick={handleClear} 
          className="btn" 
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem', background: 'var(--card-bg)', border: 'var(--glass-border)' }}
          title="Clear chat history"
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Emergency Disclaimer Banner */}
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.08)', 
        border: '1px solid rgba(239, 68, 68, 0.25)', 
        borderRadius: '12px', 
        padding: '0.65rem 1rem', 
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600 }}>
          <AlertTriangle size={16} />
          <span>If you are facing an active emergency, call 112 immediately.</span>
        </div>
        <a href="tel:112" style={{ color: '#ef4444', fontWeight: 700, textDecoration: 'underline' }}>
          Dial 112
        </a>
      </div>

      {/* Chat Messages Box */}
      <div className="card" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem',
        marginBottom: '1rem'
      }}>
        {messages.map((m, idx) => {
          const isUser = m.sender === 'USER';
          const isSystem = m.sender === 'SYSTEM';

          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              {!isUser && (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: isSystem ? 'rgba(239,68,68,0.15)' : 'rgba(139, 92, 246, 0.15)', 
                  color: isSystem ? '#ef4444' : '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isSystem ? <ShieldAlert size={18} /> : <Bot size={18} />}
                </div>
              )}

              <div style={{ 
                maxWidth: '75%', 
                padding: '1rem 1.25rem', 
                borderRadius: '18px',
                borderTopRightRadius: isUser ? '4px' : '18px',
                borderTopLeftRadius: !isUser ? '4px' : '18px',
                background: isUser ? 'var(--primary-gradient)' : (isSystem ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.04)'),
                color: isUser ? 'white' : 'var(--text-main)',
                boxShadow: isUser ? '0 4px 15px rgba(99, 102, 241, 0.25)' : 'none',
                lineHeight: 1.5,
                fontSize: '0.95rem'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.message}</div>
                {m.timestamp && (
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.4rem', textAlign: 'right' }}>
                    {m.timestamp}
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'var(--primary)', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <UserIcon size={18} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} />
            </div>
            <div style={{ padding: '0.85rem 1.25rem', borderRadius: '18px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span className="animate-pulse">Analyzing & formulating safety response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          {quickPrompts.map((p, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(p)}
              className="btn"
              style={{ 
                width: 'auto', 
                whiteSpace: 'nowrap', 
                fontSize: '0.8rem', 
                padding: '0.4rem 0.85rem',
                background: 'var(--card-bg)',
                border: 'var(--glass-border)',
                borderRadius: '9999px',
                color: 'var(--text-muted)'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
      >
        <input 
          type="text" 
          className="input-field" 
          placeholder="Ask for safety advice, de-escalation tips, or travel security..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, margin: 0, padding: '0.9rem 1.25rem' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || !input.trim()}
          style={{ width: 'auto', padding: '0.9rem 1.5rem', gap: '0.4rem' }}
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
};
