import { Link } from 'react-router-dom';
import { Add } from '@carbon/icons-react';

export default function AppHeader() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--app-shell-height)',
        backgroundColor: '#161616', // Carbon Gray 100
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 9000,
        borderBottom: '1px solid #393939',
      }}
    >
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* IBM 8-bar logo rendered in SVG */}
        <svg
          width="40"
          height="16"
          viewBox="0 0 40 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="IBM"
        >
          {/* I */}
          <rect x="0" y="0" width="6" height="2" fill="#0f62fe" />
          <rect x="0" y="7" width="6" height="2" fill="#0f62fe" />
          <rect x="0" y="14" width="6" height="2" fill="#0f62fe" />
          <rect x="2" y="2" width="2" height="5" fill="#0f62fe" />
          <rect x="2" y="9" width="2" height="5" fill="#0f62fe" />
          {/* B */}
          <rect x="9" y="0" width="6" height="2" fill="#0f62fe" />
          <rect x="9" y="7" width="5" height="2" fill="#0f62fe" />
          <rect x="9" y="14" width="6" height="2" fill="#0f62fe" />
          <rect x="9" y="2" width="2" height="5" fill="#0f62fe" />
          <rect x="9" y="9" width="2" height="5" fill="#0f62fe" />
          <rect x="13" y="2" width="2" height="3" fill="#0f62fe" />
          <rect x="12" y="9" width="2" height="3" fill="#0f62fe" />
          {/* M */}
          <rect x="18" y="0" width="2" height="16" fill="#0f62fe" />
          <rect x="36" y="0" width="2" height="16" fill="#0f62fe" />
          <rect x="20" y="0" width="2" height="2" fill="#0f62fe" />
          <rect x="34" y="0" width="2" height="2" fill="#0f62fe" />
          <rect x="22" y="2" width="2" height="2" fill="#0f62fe" />
          <rect x="32" y="2" width="2" height="2" fill="#0f62fe" />
          <rect x="24" y="4" width="2" height="2" fill="#0f62fe" />
          <rect x="30" y="4" width="2" height="2" fill="#0f62fe" />
          <rect x="26" y="6" width="4" height="2" fill="#0f62fe" />
        </svg>

        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 400,
            color: '#f4f4f4',
            letterSpacing: '0.01em',
          }}
        >
          Notes
        </span>

        <span
          style={{
            width: '1px',
            height: '1rem',
            background: '#525252',
          }}
        />

        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 300,
            color: '#8d8d8d',
          }}
        >
          Explain Notes
        </span>
      </div>

      {/* Actions */}
      <Link
        to="/new"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '0.875rem',
          color: '#78a9ff',
          textDecoration: 'none',
          padding: '0.25rem 0.5rem',
        }}
      >
        <Add size={16} />
        New Project
      </Link>
    </header>
  );
}
