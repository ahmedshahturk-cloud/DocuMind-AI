import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles, Loader2, Plus, RefreshCw } from 'lucide-react';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../lib/api';

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', animation: 'fade-in 0.3s ease' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Bot size={16} color="white" />
      </div>
      <div
        style={{
          padding: '14px 18px',
          borderRadius: '12px',
          borderTopLeftRadius: '4px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-purple)',
              animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        animation: 'slide-up 0.3s ease-out',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isUser
            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
            : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isUser ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '75%',
          padding: '14px 18px',
          borderRadius: '12px',
          borderTopRightRadius: isUser ? '4px' : '12px',
          borderTopLeftRadius: isUser ? '12px' : '4px',
          background: isUser
            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
            : 'var(--bg-tertiary)',
          color: isUser ? 'white' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border-color)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatPanel({ sessionId = 'default' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    if (sessionId === 'default') return;
    try {
      setIsHistoryLoading(true);
      const data = await getChatHistory(sessionId);
      setMessages(data.history || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    // Add user message
    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query, sessionId);
      const aiMessage = { role: 'assistant', content: response.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Something went wrong. Please try again.';
      const aiMessage = { role: 'assistant', content: `⚠️ ${errorMsg}` };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleNewChat = async () => {
    if (window.confirm('Are you sure you want to clear this chat history?')) {
      try {
        await clearChatHistory(sessionId);
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Conversation
          </span>
        </div>
        
        <button
          onClick={handleNewChat}
          disabled={messages.length === 0 || isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-purple)';
            e.currentTarget.style.color = 'var(--accent-purple)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
        }}
      >
        {isHistoryLoading ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', zIndex: 5 }}>
             <Loader2 size={32} className="animate-spin-slow" color="var(--accent-purple)" />
          </div>
        ) : null}

        {messages.length === 0 ? (
          /* Empty State */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'rgba(124, 58, 237, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <MessageSquare size={36} color="var(--accent-purple)" style={{ opacity: 0.5 }} />
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Start a conversation
            </h3>
            <p style={{ fontSize: '0.875rem', maxWidth: '360px', lineHeight: 1.6 }}>
              Upload a document and start asking questions. DocuMind AI will analyze your documents and provide intelligent answers.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {['Summarize this document', 'What are the key points?', 'Explain the main topic'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                    e.currentTarget.style.color = 'var(--accent-purple)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Sparkles size={12} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)
        )}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '16px 24px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            background: 'var(--bg-primary)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            padding: '6px 6px 6px 16px',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              maxHeight: '120px',
              padding: '8px 0',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'var(--bg-tertiary)',
              color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {isLoading ? (
              <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        <p
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          DocuMind AI answers based on your uploaded documents
        </p>
      </div>
    </div>
  );
}
