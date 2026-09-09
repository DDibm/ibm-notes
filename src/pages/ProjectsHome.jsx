import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { Tag } from '@carbon/react';
import { DocumentMultiple_01, Time, ArrowRight } from '@carbon/icons-react';

export default function ProjectsHome() {
  const { projects } = useProjects();
  const navigate = useNavigate();

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem', maxWidth: 860 }}>
        <h1
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '2rem',
            fontWeight: 300,
            color: 'var(--cds-text-primary)',
            margin: '0 0 0.5rem',
          }}
        >
          Notes Projects
        </h1>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '1rem',
            color: 'var(--cds-text-secondary)',
            margin: 0,
          }}
        >
          Each project is a set of notes you&apos;ve submitted, paired with the
          formatted document output.
        </p>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="empty-state">
          <DocumentMultiple_01 size={48} />
          <h3
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 400,
              margin: '0.5rem 0 0.25rem',
              color: 'var(--cds-text-primary)',
            }}
          >
            No projects yet
          </h3>
          <p style={{ margin: 0, maxWidth: 360 }}>
            Create a new project to start transforming your notes into
            beautifully formatted documents.
          </p>
        </div>
      )}

      {/* Project cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
          maxWidth: 1200,
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => navigate(`/project/${project.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(`/project/${project.id}`);
              }
            }}
            style={{
              background: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle-01)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {/* Title */}
            <h2
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--cds-text-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {project.title}
            </h2>

            {/* Subject */}
            {project.subject && (
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '0.875rem',
                  color: 'var(--cds-text-secondary)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {project.subject}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="meta-row">
                {project.tags.slice(0, 4).map((tag) => (
                  <Tag key={tag} type="blue" size="sm">
                    {tag}
                  </Tag>
                ))}
                {project.tags.length > 4 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--cds-text-helper)',
                    }}
                  >
                    +{project.tags.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Footer row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--cds-border-subtle-01)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-helper)',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                <Time size={14} />
                {project.readTime || '–'}
                &nbsp;·&nbsp;
                {formatDate(project.createdAt)}
              </div>
              <ArrowRight size={16} style={{ color: 'var(--cds-interactive)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
