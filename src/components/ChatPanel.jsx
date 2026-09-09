import { useState, useRef, useEffect } from 'react';
import { Button, TextArea, InlineLoading } from '@carbon/react';
import { Send, Close, Bot, UserAvatar, WarningAlt } from '@carbon/icons-react';

/**
 * ChatPanel — slide-in chat sidebar for a notes project.
 *
 * Props:
 *   project  — the current project object (title, output, rawNotes)
 *   onClose  — callback to close the panel
 */
export default function ChatPanel({ project, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I've read through **"${project.title}"**. Ask me anything about it — key concepts, deeper explanations, comparisons, or anything else.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Build the system prompt from the project content
  const buildSystemPrompt = () => {
    const parts = [
      'You are a helpful assistant embedded in a personal notes app.',
      'The user is asking questions about a specific notes project.',
      '',
      `Project title: ${project.title}`,
      project.subject ? `Subject: ${project.subject}` : '',
      project.audience ? `Audience: ${project.audience}` : '',
      '',
      '--- PROJECT DOCUMENT ---',
      project.output,
    ];

    if (project.rawNotes) {
      parts.push('', '--- RAW NOTES ---', project.rawNotes);
    }

    parts.push(
      '',
      '--- INSTRUCTIONS ---',
      'Answer questions based on the project content above.',
      'Be concise, clear, and accurate.',
      'If the answer is not covered in the notes, say so honestly.',
      'Use markdown formatting in your responses.'
    );

    return parts.filter((p) => p !== undefined).join('\n');
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError('');
    setLoading(true);

    // Only send the last 10 messages to stay within token limits
    const recentMessages = updatedMessages.slice(-10);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          systemPrompt: buildSystemPrompt(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      }
    } catch (err) {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--app-shell-height)',
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: 'var(--cds-layer-01)',
        borderLeft: '1px solid var(--cds-border-subtle-01)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 7000,
        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          borderBottom: '1px solid var(--cds-border-subtle-01)',
          backgroundColor: 'var(--cds-layer-02)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={20} style={{ color: 'var(--cds-interactive)' }} />
          <div>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--cds-text-primary)',
                margin: 0,
              }}
            >
              Ask about these notes
            </p>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '0.75rem',
                color: 'var(--cds-text-helper)',
                margin: 0,
              }}
            >
              Powered by IBM watsonx.ai · Granite 3.3
            </p>
          </div>
        </div>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Close}
          iconDescription="Close chat"
          hasIconOnly
          onClick={onClose}
        />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderRadius: '4px',
              alignSelf: 'flex-start',
              maxWidth: '85%',
            }}
          >
            <InlineLoading description="Thinking…" style={{ margin: 0 }} />
          </div>
        )}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(218, 30, 40, 0.06)',
              border: '1px solid rgba(218, 30, 40, 0.2)',
              borderRadius: '4px',
            }}
          >
            <WarningAlt size={16} style={{ color: '#da1e28', flexShrink: 0, marginTop: '0.125rem' }} />
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '0.8125rem',
                color: '#da1e28',
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          borderTop: '1px solid var(--cds-border-subtle-01)',
          padding: '0.75rem',
          backgroundColor: 'var(--cds-layer-01)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <TextArea
            ref={textareaRef}
            id="chat-input"
            labelText=""
            hideLabel
            placeholder="Ask anything about these notes… (Enter to send, Shift+Enter for newline)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={loading}
            style={{ flex: 1, resize: 'none' }}
          />
          <Button
            kind="primary"
            size="md"
            renderIcon={Send}
            iconDescription="Send"
            hasIconOnly
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{ flexShrink: 0 }}
          />
        </div>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.6875rem',
            color: 'var(--cds-text-helper)',
            margin: '0.375rem 0 0',
          }}
        >
          Context: this project's notes and formatted document
        </p>
      </div>
    </div>
  );
}

// Individual message bubble
function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '0.25rem',
      }}
    >
      {/* Role label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--cds-text-helper)',
          fontSize: '0.6875rem',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        {isUser ? (
          <>
            <UserAvatar size={12} />
            You
          </>
        ) : (
          <>
            <Bot size={12} style={{ color: 'var(--cds-interactive)' }} />
            Granite 3.3
          </>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '90%',
          padding: '0.625rem 0.875rem',
          borderRadius: '4px',
          backgroundColor: isUser ? 'var(--cds-interactive)' : 'var(--cds-layer-02)',
          color: isUser ? '#ffffff' : 'var(--cds-text-primary)',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '0.875rem',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <SimpleMarkdown text={message.content} isUser={isUser} />
      </div>
    </div>
  );
}

// Lightweight inline markdown renderer for chat bubbles
// Handles: **bold**, *italic*, `code`, and line breaks
function SimpleMarkdown({ text, isUser }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        // Render each line with inline markdown
        const rendered = renderInline(line, isUser);
        return (
          <span key={i}>
            {rendered}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

function renderInline(text, isUser) {
  // Split on bold (**), italic (*), and inline code (`)
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={match.index} style={{ fontWeight: 600 }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*')) {
      parts.push(
        <em key={match.index} style={{ fontStyle: 'italic' }}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={match.index}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.8125rem',
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'var(--cds-layer-03)',
            padding: '0.1em 0.3em',
            borderRadius: '2px',
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
