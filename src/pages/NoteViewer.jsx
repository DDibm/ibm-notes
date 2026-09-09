import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { Button, Tag } from '@carbon/react';
import { ArrowLeft, TrashCan, Time, UserMultiple } from '@carbon/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="empty-state" style={{ padding: '4rem 2rem' }}>
        <h2
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 300,
            color: 'var(--cds-text-primary)',
          }}
        >
          Project not found
        </h2>
        <Button kind="ghost" onClick={() => navigate('/')} renderIcon={ArrowLeft}>
          Back to projects
        </Button>
      </div>
    );
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleDelete = () => {
    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      deleteProject(project.id);
      navigate('/');
    }
  };

  // Custom renderers for react-markdown
  const components = {
    // Style blockquotes as callout cards
    blockquote({ children }) {
      const text = String(children);
      let cls = 'callout-info';
      if (text.includes('⚠️') || text.includes('Watch Out')) cls = 'callout-warning';
      else if (text.includes('🔍')) cls = 'callout-info';
      else if (text.includes('💡')) cls = 'callout-success';
      else if (text.includes('⚡')) cls = 'callout-warning';
      return <blockquote className={cls}>{children}</blockquote>;
    },
    // Render mermaid code blocks as styled pre blocks (no live rendering needed)
    code({ className, children, ...props }) {
      const isMermaid = className === 'language-mermaid';
      if (isMermaid) {
        return (
          <div className="mermaid-block">
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                color: 'var(--cds-interactive)',
              }}
            >
              Diagram
            </div>
            <pre style={{ margin: 0, textAlign: 'left' }}>{children}</pre>
          </div>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Tables
    table({ children }) {
      return (
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <div>
      {/* Header bar */}
      <div className="note-viewer-header">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={() => navigate('/')}
          style={{ marginBottom: '1rem', paddingLeft: 0 }}
        >
          All Projects
        </Button>

        <h1
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 300,
            color: 'var(--cds-text-primary)',
            margin: '0 0 0.75rem',
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </h1>

        {/* Meta row */}
        <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
          {project.readTime && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8125rem',
                color: 'var(--cds-text-secondary)',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <Time size={14} />
              {project.readTime}
            </span>
          )}
          {project.audience && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8125rem',
                color: 'var(--cds-text-secondary)',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              <UserMultiple size={14} />
              {project.audience}
            </span>
          )}
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--cds-text-helper)',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {formatDate(project.createdAt)}
          </span>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
            {project.tags.map((tag) => (
              <Tag key={tag} type="blue" size="sm">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
          <Button
            kind="danger--ghost"
            size="sm"
            renderIcon={TrashCan}
            onClick={handleDelete}
          >
            Delete project
          </Button>
        </div>
      </div>

      {/* Document content */}
      <div className="note-viewer-content">
        <div className="note-document">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {project.output}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
