import { Link, useLocation } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { DocumentMultiple_01, Add, Home } from '@carbon/icons-react';

export default function Sidebar() {
  const { projects } = useProjects();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      {/* Home */}
      <div style={{ padding: '1rem 0 0.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 1rem',
            textDecoration: 'none',
            color: isActive('/') ? 'var(--cds-interactive)' : 'var(--cds-text-secondary)',
            backgroundColor: isActive('/') ? 'var(--cds-layer-selected-01)' : 'transparent',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: isActive('/') ? 600 : 400,
            transition: 'background-color 0.1s',
          }}
        >
          <Home size={16} />
          All Projects
        </Link>

        <Link
          to="/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.625rem 1rem',
            textDecoration: 'none',
            color: isActive('/new') ? 'var(--cds-interactive)' : 'var(--cds-text-secondary)',
            backgroundColor: isActive('/new') ? 'var(--cds-layer-selected-01)' : 'transparent',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: isActive('/new') ? 600 : 400,
          }}
        >
          <Add size={16} />
          New Project
        </Link>
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'var(--cds-border-subtle-01)',
          margin: '0.25rem 0',
        }}
      />

      {/* Projects list */}
      <div style={{ padding: '0.5rem 0' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--cds-text-helper)',
            padding: '0.375rem 1rem',
            margin: 0,
          }}
        >
          Recent Projects
        </p>
        {projects.length === 0 && (
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '0.8125rem',
              color: 'var(--cds-text-helper)',
              padding: '0.375rem 1rem',
              margin: 0,
            }}
          >
            No projects yet
          </p>
        )}
        {projects.map((project) => {
          const path = `/project/${project.id}`;
          const active = isActive(path);
          return (
            <Link
              key={project.id}
              to={path}
              title={project.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                color: active ? 'var(--cds-interactive)' : 'var(--cds-text-primary)',
                backgroundColor: active ? 'var(--cds-layer-selected-01)' : 'transparent',
                borderLeft: active ? '3px solid var(--cds-interactive)' : '3px solid transparent',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '0.8125rem',
                lineHeight: 1.4,
              }}
            >
              <DocumentMultiple_01
                size={16}
                style={{ marginTop: '0.125rem', flexShrink: 0 }}
              />
              <span
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {project.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
