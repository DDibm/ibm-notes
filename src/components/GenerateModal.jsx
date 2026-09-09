import { useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { Close, Idea, PresentationFile, ChevronRight } from '@carbon/icons-react';

/**
 * GenerateModal — lets the user pick Flashcards or Presentation,
 * calls /api/generate, and returns the result.
 *
 * Props:
 *   project   — current project
 *   onClose   — fn
 *   onGenerated(type, data) — fn called with result
 *   existing  — { flashcards?, presentation? } — already-saved artifacts
 */
export default function GenerateModal({ project, onClose, onGenerated, existing }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async (type) => {
    setLoading(type);
    setError('');

    const projectContent = [project.output, project.rawNotes]
      .filter(Boolean)
      .join('\n\n');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, projectContent, projectTitle: project.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      onGenerated(type, data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000, padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--cds-background)',
        width: '100%', maxWidth: 520,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--cds-border-subtle-01)',
        }}>
          <div>
            <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
              Generate learning material
            </h2>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.8125rem', color: 'var(--cds-text-helper)', margin: '0.25rem 0 0' }}>
              Powered by IBM watsonx.ai · Granite 3.3
            </p>
          </div>
          <Button kind="ghost" size="sm" renderIcon={Close} hasIconOnly iconDescription="Close" onClick={onClose} />
        </div>

        {/* Options */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Flashcards option */}
          <OptionCard
            icon={<Idea size={24} style={{ color: '#0f62fe' }} />}
            title="Flashcards"
            description="12 question-and-answer cards you can flip through and track what you know. Perfect for active recall."
            badge={existing?.flashcards ? 'Regenerate' : 'New'}
            badgeType={existing?.flashcards ? 'cool-gray' : 'blue'}
            loading={loading === 'flashcards'}
            disabled={!!loading}
            onClick={() => generate('flashcards')}
          />

          {/* Presentation option */}
          <OptionCard
            icon={<PresentationFile size={24} style={{ color: '#6929c4' }} />}
            title="Presentation"
            description="8-slide deck with titles, bullet points, and speaker notes. Great for reviewing or presenting to others."
            badge={existing?.presentation ? 'Regenerate' : 'New'}
            badgeType={existing?.presentation ? 'cool-gray' : 'purple'}
            loading={loading === 'presentation'}
            disabled={!!loading}
            onClick={() => generate('presentation')}
          />

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(218, 30, 40, 0.06)',
              border: '1px solid rgba(218, 30, 40, 0.2)',
              borderRadius: 4,
            }}>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.8125rem', color: '#da1e28', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {/* Existing artifacts */}
          {(existing?.flashcards || existing?.presentation) && (
            <div style={{ borderTop: '1px solid var(--cds-border-subtle-01)', paddingTop: '0.75rem' }}>
              <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.75rem', color: 'var(--cds-text-helper)', margin: '0 0 0.5rem' }}>
                Previously generated
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {existing.flashcards && (
                  <Button kind="ghost" size="sm" onClick={() => { onGenerated('flashcards', existing.flashcards); }}>
                    View flashcards ({existing.flashcards.length})
                  </Button>
                )}
                {existing.presentation && (
                  <Button kind="ghost" size="sm" onClick={() => { onGenerated('presentation', existing.presentation); }}>
                    View presentation ({existing.presentation.length} slides)
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionCard({ icon, title, description, badge, badgeType, loading, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle-01)',
        borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left', width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
        opacity: disabled && !loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = '#0f62fe'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--cds-border-subtle-01)'; }}
    >
      <div style={{ flexShrink: 0 }}>{loading ? <InlineLoading style={{ width: 24 }} /> : icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
            {title}
          </span>
          <span style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.6875rem', fontWeight: 600,
            padding: '0.1em 0.5em',
            borderRadius: 2,
            background: badgeType === 'purple' ? '#6929c4' : badgeType === 'blue' ? '#0f62fe' : 'var(--cds-layer-02)',
            color: badgeType !== 'cool-gray' ? '#fff' : 'var(--cds-text-secondary)',
            letterSpacing: '0.04em',
          }}>
            {badge}
          </span>
        </div>
        <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--cds-icon-secondary)', flexShrink: 0 }} />
    </button>
  );
}
