import { useState } from 'react';
import { Button, Tag } from '@carbon/react';
import { Close, ChevronLeft, ChevronRight } from '@carbon/icons-react';

/**
 * PresentationView
 * Props:
 *   slides   — [{ slideNumber, title, type, content, bullets, speakerNote }]
 *   onClose  — fn
 */
export default function PresentationView({ slides, onClose }) {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const slide = slides[index];
  const isTitleSlide = slide.type === 'title';
  const isSummary = slide.type === 'summary';

  const goNext = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const typeColors = {
    title: '#0f62fe',
    concept: '#6929c4',
    list: '#005d5d',
    comparison: '#9f1853',
    summary: '#198038',
  };

  const accentColor = typeColors[slide.type] || '#0f62fe';

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#161616',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.8125rem', color: '#a8a8a8' }}>
              Slide {index + 1} / {slides.length}
            </span>
            <Tag type="cool-gray" size="sm">{slide.type}</Tag>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setShowNotes((s) => !s)}
              style={{ color: showNotes ? '#78a9ff' : '#a8a8a8', fontSize: '0.75rem' }}
            >
              {showNotes ? 'Hide notes' : 'Speaker notes'}
            </Button>
            <Button kind="ghost" size="sm" renderIcon={Close} hasIconOnly iconDescription="Close" onClick={onClose}
              style={{ color: '#a8a8a8' }} />
          </div>
        </div>

        {/* Slide body */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: isTitleSlide ? '#0f62fe' : (isSummary ? '#001141' : 'var(--cds-background)'),
          overflow: 'hidden',
        }}>
          {/* Accent bar */}
          {!isTitleSlide && (
            <div style={{ height: 4, background: accentColor, flexShrink: 0 }} />
          )}

          {/* Content area */}
          <div style={{
            flex: 1,
            padding: isTitleSlide ? '3rem' : '2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isTitleSlide ? 'center' : 'flex-start',
            overflow: 'auto',
          }}>
            {/* Slide number badge */}
            {!isTitleSlide && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.6875rem',
                color: accentColor,
                fontWeight: 600,
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                {slide.type} · {String(slide.slideNumber).padStart(2, '0')}
              </span>
            )}

            {/* Title */}
            <h2 style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: isTitleSlide ? '2.25rem' : '1.75rem',
              fontWeight: isTitleSlide ? 300 : 600,
              color: isTitleSlide || isSummary ? '#ffffff' : 'var(--cds-text-primary)',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
            }}>
              {slide.title}
            </h2>

            {/* Content text */}
            {slide.content && (
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '1rem',
                color: isTitleSlide || isSummary ? 'rgba(255,255,255,0.85)' : 'var(--cds-text-secondary)',
                margin: '0 0 1.25rem',
                lineHeight: 1.6,
                maxWidth: 640,
              }}>
                {slide.content}
              </p>
            )}

            {/* Bullets */}
            {slide.bullets && slide.bullets.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {slide.bullets.map((b, i) => (
                  <li key={i} style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '0.9375rem',
                    color: isTitleSlide || isSummary ? 'rgba(255,255,255,0.9)' : 'var(--cds-text-primary)',
                    lineHeight: 1.5,
                  }}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Speaker notes drawer */}
          {showNotes && slide.speakerNote && (
            <div style={{
              padding: '0.875rem 2rem',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}>
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '0.8125rem',
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}>
                <strong style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Speaker note:{' '}
                </strong>
                {slide.speakerNote}
              </p>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--cds-border-subtle-01)',
          backgroundColor: 'var(--cds-layer-01)',
          flexShrink: 0,
        }}>
          {/* Slide thumbnails / dots */}
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                style={{
                  width: i === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === index ? '#0f62fe' : 'var(--cds-border-strong-01)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.2s, background 0.2s',
                }}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="secondary" size="sm" renderIcon={ChevronLeft} onClick={goPrev} disabled={index === 0}>
              Previous
            </Button>
            <Button kind="primary" size="sm" renderIcon={ChevronRight} onClick={goNext} disabled={index === slides.length - 1}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9500, padding: '1rem',
};

const panelStyle = {
  backgroundColor: 'var(--cds-background)',
  width: '100%', maxWidth: 860,
  height: '90vh', maxHeight: 620,
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  borderRadius: 4, overflow: 'hidden',
};
