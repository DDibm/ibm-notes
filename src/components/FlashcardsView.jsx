import { useState, useEffect, useCallback } from 'react';
import { Button, Tag } from '@carbon/react';
import { Close, ChevronLeft, ChevronRight, Renew } from '@carbon/icons-react';

/**
 * FlashcardsView
 * Props:
 *   cards    — [{ front, back }]
 *   onClose  — fn
 */
export default function FlashcardsView({ cards, onClose }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [reviewing, setReviewing] = useState(false); // review-only mode

  const activeCards = reviewing ? cards.filter((_, i) => !known.has(i)) : cards;
  const activeIndex = Math.min(index, activeCards.length - 1);
  const card = activeCards[activeIndex];
  const progress = Math.round((known.size / cards.length) * 100);

  const goNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, activeCards.length - 1)), 150);
  }, [activeCards.length]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  }, []);

  const markKnown = () => {
    setKnown((prev) => new Set([...prev, cards.indexOf(card)]));
    goNext();
  };

  const reset = () => {
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setReviewing(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!card) {
    return (
      <div style={overlayStyle}>
        <div style={panelStyle}>
          <Header title="Flashcards" onClose={onClose} />
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--cds-text-secondary)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🎉 All cards marked as known!</p>
            <Button kind="secondary" renderIcon={Renew} onClick={reset}>Start over</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <Header title={`Flashcards (${cards.length})`} onClose={onClose} />

        {/* Progress bar */}
        <div style={{ padding: '0.75rem 1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={metaStyle}>Card {activeIndex + 1} of {activeCards.length}</span>
            <span style={metaStyle}>{known.size}/{cards.length} known · {progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--cds-layer-02)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#24a148', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Card flip area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            aria-label={flipped ? 'Showing answer — click to see question' : 'Showing question — click to see answer'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); } }}
            style={{
              width: '100%',
              maxWidth: 560,
              minHeight: 200,
              background: flipped ? '#0f62fe' : 'var(--cds-layer-01)',
              border: `2px solid ${flipped ? '#0f62fe' : 'var(--cds-border-subtle-01)'}`,
              borderRadius: 8,
              padding: '2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transition: 'background 0.2s, border-color 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              outline: 'none',
              userSelect: 'none',
            }}
          >
            <span style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: flipped ? 'rgba(255,255,255,0.7)' : 'var(--cds-text-helper)',
              marginBottom: '0.75rem',
            }}>
              {flipped ? 'Answer' : 'Question'}
            </span>
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: flipped ? '1rem' : '1.125rem',
              fontWeight: flipped ? 400 : 600,
              color: flipped ? '#ffffff' : 'var(--cds-text-primary)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {flipped ? card.back : card.front}
            </p>
            <span style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '0.75rem',
              color: flipped ? 'rgba(255,255,255,0.5)' : 'var(--cds-text-helper)',
              marginTop: '1.25rem',
            }}>
              Click to flip · Space to flip · ← → to navigate
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding: '0.75rem 1.5rem 1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button kind="ghost" size="sm" renderIcon={ChevronLeft} onClick={goPrev} disabled={activeIndex === 0} hasIconOnly iconDescription="Previous card" />
          <Button kind="ghost" size="sm" renderIcon={ChevronRight} onClick={goNext} disabled={activeIndex === activeCards.length - 1} hasIconOnly iconDescription="Next card" />
          <Button kind="tertiary" size="sm" onClick={() => setFlipped((f) => !f)}>Flip</Button>
          <Button
            kind="primary"
            size="sm"
            onClick={markKnown}
            disabled={known.has(cards.indexOf(card))}
          >
            {known.has(cards.indexOf(card)) ? '✓ Known' : 'Mark as known'}
          </Button>
          <Button kind="ghost" size="sm" renderIcon={Renew} onClick={reset}>Reset</Button>
        </div>

        {/* Known cards tags */}
        {known.size > 0 && (
          <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            <span style={metaStyle}>Known: </span>
            {[...known].map((i) => (
              <Tag key={i} type="green" size="sm">{cards[i].front.slice(0, 28)}{cards[i].front.length > 28 ? '…' : ''}</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.5rem', borderBottom: '1px solid var(--cds-border-subtle-01)',
      flexShrink: 0,
    }}>
      <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
        {title}
      </h2>
      <Button kind="ghost" size="sm" renderIcon={Close} hasIconOnly iconDescription="Close" onClick={onClose} />
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9500, padding: '1rem',
};

const panelStyle = {
  backgroundColor: 'var(--cds-background)',
  borderRadius: 4, width: '100%', maxWidth: 680,
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
  overflow: 'hidden',
};

const metaStyle = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: '0.75rem', color: 'var(--cds-text-helper)',
};
