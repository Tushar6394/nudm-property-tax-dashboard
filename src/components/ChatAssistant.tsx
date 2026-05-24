import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import type { ChatMessage, Property } from '../types';
import { askGemini } from '../services/gemini';

interface ChatAssistantProps {
  properties: Property[];
  selectedCity: string;
}

// Static initial welcome message defined outside component to avoid impure new Date() calls during render
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    sender: 'ai',
    text: 'Namaste! I am the **UPYOG Intelligent Property Tax Assistant**. Ask me any analytical question about the 1,000 property records across our 10 municipalities!',
    timestamp: new Date()
  }
];

// Helper to create a chat message defined outside to keep the main component pure
const createChatMessage = (sender: 'user' | 'ai', text: string): ChatMessage => {
  return {
    id: `${sender}-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`,
    sender,
    text,
    timestamp: new Date()
  };
};

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ properties, selectedCity }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic context-aware preset questions based on selected city
  const presetQuestions = React.useMemo(() => {
    if (selectedCity === 'All Cities') {
      return [
        { label: 'Highest tax collection?', text: 'Which city has the highest tax collection?' },
        { label: 'Mumbai rejections?', text: 'How many properties are rejected in Mumbai?' },
        { label: 'Bengaluru approval %', text: 'What is the percentage of approved properties in Bengaluru?' },
        { label: 'Compare Pune vs Jaipur', text: 'Compare total registrations between Pune and Jaipur' }
      ];
    }

    return [
      { label: `Rejections here?`, text: `How many properties are rejected in ${selectedCity}?` },
      { label: `Approval % here?`, text: `What is the percentage of approved properties in ${selectedCity}?` },
      { label: `Total collection here?`, text: `What is the total tax collection in ${selectedCity}?` },
      { label: 'Highest tax collection?', text: 'Which city has the highest tax collection?' }
    ];
  }, [selectedCity]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg = createChatMessage('user', textToSend);

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await askGemini(textToSend, properties, selectedCity);
      const aiMsg = createChatMessage('ai', responseText);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for bold words and bullet points
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      // Bold words
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleaned = content.substring(2);
        return (
          <li key={idx} style={styles.bulletItem} dangerouslySetInnerHTML={{ __html: cleaned }} />
        );
      }
      return (
        <p key={idx} style={styles.paragraph} dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  return (
    <div style={styles.chatContainer} className="glass-panel">
      <div style={styles.chatHeader}>
        <div style={styles.headerInfo}>
          <div style={styles.avatarGlow}>
            <Bot size={20} color="var(--primary)" />
          </div>
          <div>
            <h4 style={styles.headerTitle}>Gemini AI Tenant Copilot</h4>
            <span style={styles.headerSubtitle}>Real-time Municipal Assistant</span>
          </div>
        </div>
        <div style={styles.sparkleContainer}>
          <Sparkles size={14} color="var(--primary)" />
          <span style={styles.sparkleLabel}>Gemini 1.5 Flash Active</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div style={styles.viewport}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{ ...styles.avatar, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Bot size={16} />
              </div>
            )}
            <div
              style={{
                ...styles.bubble,
                background: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                border: msg.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
                borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px'
              }}
            >
              {renderMarkdown(msg.text)}
            </div>
            {msg.sender === 'user' && (
              <div style={{ ...styles.avatar, background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={styles.messageRow}>
            <div style={{ ...styles.avatar, background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Bot size={16} />
            </div>
            <div style={styles.typingBubble}>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Slider */}
      <div style={styles.presetsWrapper}>
        <div style={styles.presetLabel}>
          <AlertCircle size={12} color="var(--text-muted)" />
          <span>Quick Analytical Queries:</span>
        </div>
        <div style={styles.presets}>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              style={styles.presetBtn}
              className="glass-panel"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        style={styles.inputForm}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about rejections, approvals, highest collection..."
          style={styles.inputField}
          disabled={isTyping}
        />
        <button
          type="submit"
          style={{
            ...styles.sendBtn,
            background: input.trim() ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            cursor: input.trim() ? 'pointer' : 'default'
          }}
          disabled={!input.trim() || isTyping}
        >
          <Send size={16} color={input.trim() ? '#060913' : 'var(--text-muted)'} />
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '560px',
    width: '100%',
    overflow: 'hidden'
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(6, 9, 19, 0.2)'
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarGlow: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--primary-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px var(--primary-glow)'
  },
  headerTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--text-primary)'
  },
  headerSubtitle: {
    fontSize: '0.74rem',
    color: 'var(--text-secondary)'
  },
  sparkleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  sparkleLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--primary)'
  },
  viewport: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  messageRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    maxWidth: '85%'
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    color: 'var(--text-primary)'
  },
  typingBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    minWidth: '55px'
  },
  paragraph: {
    marginBottom: '8px',
    marginTop: 0
  },
  bulletItem: {
    marginLeft: '16px',
    marginBottom: '4px'
  },
  presetsWrapper: {
    padding: '8px 16px',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(0,0,0,0.1)'
  },
  presetLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '6px'
  },
  presets: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  presetBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  inputForm: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    background: 'rgba(6, 9, 19, 0.3)'
  },
  inputField: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }
};
