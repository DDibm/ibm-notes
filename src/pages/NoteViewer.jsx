import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { Button, Tag } from '@carbon/react';
import { ArrowLeft, TrashCan, Time, UserMultiple, Chat, LightFilled, PresentationFile } from '@carbon/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatPanel from '../components/ChatPanel';
import GenerateModal from '../components/GenerateModal';
import FlashcardsView from '../components/FlashcardsView';
import PresentationView from '../components/PresentationView';

export default function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, deleteProject, updateProject } = useProjects();

  const [chatOpen, setChatOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [activeView, setActiveView] = useState(null); // null | 'flashcards' | 'presentation'

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="empty-state" style={{ padding: '4rem 2rem' }}>
        <h2 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 300, color: 'var(--cds-text-primary)' }}>
          Project not found
        </h2>
        <Button kind="ghost" onClick={() => navigate('/')} renderIcon={ArrowLeft}>
          Back to projects
        </Button>
      </div>
    );
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDelete = () => {
    if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      deleteProject(project.id);
      navigate('/');
    }
  };

  // Called when GenerateModal returns a result — save to project + open viewer
  const handleGenerated = (type, data) => {
    setGenerateOpen(false);
    // Persist the artifact to the project
    updateProject(project.id, {
      artifacts: {
        ...(project.artifacts || {}),
        [type]: data,
      },
    });
    setActiveView(type);
  };

  const markdownComponents = {
    blockquote({ children }) {
      const text = String(children);
      let cls = 'callout-info';
      if (text.includes('⚠️') || text.includes('Watch Out')) cls = 'callout-warning';
      else if (text.includes('💡')) cls = 'callout-success';
      else if (text.includes('⚡')) cls = 'callout-warning';
      return <blockquote className={cls}>{children}</blockquote>;
    },
    code({ className, children, ...props }) {
      if (className === 'language-mermaid') {
        return (
          <div className="mermaid-block">
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--cds-interactive)' }}>
              Diagram
            </div>
            <pre style={{ margin: 0, textAlign: 'left' }}>{children}</pre>
          </div>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    table({ children }) {
      return <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}><table>{children}</table></div>;
    },
  };

  const existing = project.artifacts || {};
  const hasArtifacts = existing.flashcards || existing.presentation;

  return (
    <div>
      {/* Header */}
      <div className="note-viewer-header">
        <Button kind="ghost" size="sm" renderIcon={ArrowLeft} onClick={() => navigate('/')} style={{ marginBottom: '1rem', paddingLeft: 0 }}>
          All Projects
        </Button>

        <h1 style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '1.75rem', fontWeight: 300, color: 'var(--cds-text-primary)', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
          {project.title}
        </h1>

        {/* Meta */}
        <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
          {project.readTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <Time size={14} />{project.readTime}
            </span>
          )}
          {project.audience && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <UserMultiple size={14} />{project.audience}
            </span>
          )}
          <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-helper)', fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {formatDate(project.createdAt)}
          </span>
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
            {project.tags.map((tag) => <Tag key={tag} type="blue" size="sm">{tag}</Tag>)}
          </div>
        )}

        {/* Saved artifacts badges */}
        {hasArtifacts && (
          <div className="meta-row" style={{ marginBottom: '0.75rem' }}>
            {existing.flashcards && (
              <button
                onClick={() => setActiveView('flashcards')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: '1px solid #0f62fe', borderRadius: 12, padding: '0.2em 0.625em', cursor: 'pointer', color: '#0f62fe', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600 }}
              >
                <LightFilled size={12} /> {existing.flashcards.length} flashcards saved
              </button>
            )}
            {existing.presentation && (
              <button
                onClick={() => setActiveView('presentation')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: '1px solid #6929c4', borderRadius: 12, padding: '0.2em 0.625em', cursor: 'pointer', color: '#6929c4', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600 }}
              >
                <PresentationFile size={12} /> {existing.presentation.length} slides saved
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
          <Button kind="primary" size="sm" renderIcon={LightFilled} onClick={() => setGenerateOpen(true)}>
            Generate learning material
          </Button>
          <Button kind="secondary" size="sm" renderIcon={Chat} onClick={() => setChatOpen((v) => !v)}>
            {chatOpen ? 'Close chat' : 'Ask AI'}
          </Button>
          <Button kind="danger--ghost" size="sm" renderIcon={TrashCan} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="note-viewer-content" style={{ marginRight: chatOpen ? '420px' : 0, transition: 'margin-right 0.2s ease' }}>
        <div className="note-document">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {project.output}
          </ReactMarkdown>
        </div>
      </div>

      {/* Modals & panels */}
      {chatOpen && <ChatPanel project={project} onClose={() => setChatOpen(false)} />}

      {generateOpen && (
        <GenerateModal
          project={project}
          onClose={() => setGenerateOpen(false)}
          onGenerated={handleGenerated}
          existing={existing}
        />
      )}

      {activeView === 'flashcards' && existing.flashcards && (
        <FlashcardsView cards={existing.flashcards} onClose={() => setActiveView(null)} />
      )}

      {activeView === 'presentation' && existing.presentation && (
        <PresentationView slides={existing.presentation} onClose={() => setActiveView(null)} />
      )}
    </div>
  );
}
