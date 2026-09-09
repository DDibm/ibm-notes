import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import {
  TextInput,
  TextArea,
  Button,
  Tag,
  InlineNotification,
} from '@carbon/react';
import { Add, ArrowLeft } from '@carbon/icons-react';
import FileDropZone from '../components/FileDropZone';

export default function NewProject() {
  const navigate = useNavigate();
  const { addProject } = useProjects();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('');
  const [readTime, setReadTime] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [output, setOutput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  // Called when FileDropZone extracts text — appends to existing raw notes
  const handleFilesExtracted = (text) => {
    setRawNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A project title is required.');
      return;
    }
    if (!output.trim()) {
      setError('Please paste the formatted document output.');
      return;
    }
    setError('');

    const project = {
      id: `project-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      audience: audience.trim(),
      readTime: readTime.trim(),
      rawNotes: rawNotes.trim(),
      output: output.trim(),
      tags,
      createdAt: new Date().toISOString(),
    };

    addProject(project);
    navigate(`/project/${project.id}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 760 }}>
      <Button
        kind="ghost"
        size="sm"
        renderIcon={ArrowLeft}
        onClick={() => navigate('/')}
        style={{ paddingLeft: 0, marginBottom: '1.5rem' }}
      >
        All Projects
      </Button>

      <h1
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '2rem',
          fontWeight: 300,
          color: 'var(--cds-text-primary)',
          margin: '0 0 0.5rem',
        }}
      >
        New Project
      </h1>
      <p
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '1rem',
          color: 'var(--cds-text-secondary)',
          margin: '0 0 2rem',
        }}
      >
        Save a notes project — drop in your source files and paste the formatted output.
      </p>

      {error && (
        <InlineNotification
          kind="error"
          title="Validation error"
          subtitle={error}
          style={{ marginBottom: '1.5rem' }}
          lowContrast
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <TextInput
          id="project-title"
          labelText="Project title *"
          placeholder="e.g. IBM + Confluent: The Real-Time Data Platform"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextInput
          id="project-subject"
          labelText="Subject area"
          placeholder="e.g. Enterprise Data Streaming & AI Architecture"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <TextInput
          id="project-audience"
          labelText="Target audience"
          placeholder="e.g. CIO, CTO, Enterprise Architects"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />

        <TextInput
          id="project-readtime"
          labelText="Read time"
          placeholder="e.g. 10 min read"
          value={readTime}
          onChange={(e) => setReadTime(e.target.value)}
        />

        {/* Tags */}
        <div>
          <label
            htmlFor="tag-input"
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--cds-text-primary)',
              marginBottom: '0.375rem',
              display: 'block',
            }}
          >
            Tags
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TextInput
              id="tag-input"
              labelText=""
              hideLabel
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button kind="secondary" size="md" renderIcon={Add} onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="meta-row">
              {tags.map((t) => (
                <Tag key={t} type="blue" size="sm" onClose={() => removeTag(t)} filter>
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* File drop zone — populates raw notes */}
        <FileDropZone
          label="Raw notes — drag & drop files"
          onFilesExtracted={handleFilesExtracted}
        />

        {/* Raw notes textarea — shows extracted text, also manually editable */}
        <TextArea
          id="project-raw-notes"
          labelText="Extracted notes (editable)"
          helperText="Populated automatically from dropped files, or paste manually"
          placeholder="Your raw notes will appear here after dropping files…"
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          rows={6}
        />

        <TextArea
          id="project-output"
          labelText="Formatted document output *"
          placeholder="Paste the full markdown document output here…"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          rows={16}
          required
        />

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <Button type="submit" kind="primary">
            Save Project
          </Button>
          <Button kind="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
