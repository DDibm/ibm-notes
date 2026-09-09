import { useState, useRef, useCallback } from 'react';
import { InlineLoading } from '@carbon/react';
import { DocumentAdd, DocumentBlank, TrashCan, CheckmarkFilled, WarningAlt } from '@carbon/icons-react';
import mammoth from 'mammoth';

/**
 * FileDropZone — drag-and-drop file uploader that extracts text content.
 *
 * Supported formats: .txt, .md, .docx
 *
 * Props:
 *   onFilesExtracted(text: string) — called with combined extracted text
 *   label                         — optional label string
 */
export default function FileDropZone({ onFilesExtracted, label = 'Raw notes' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]); // [{ name, status: 'loading'|'done'|'error', error? }]
  const inputRef = useRef(null);

  const extractText = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt' || ext === 'md') {
      return await file.text();
    }

    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    throw new Error(`Unsupported file type: .${ext}. Use .txt, .md, or .docx`);
  };

  const processFiles = useCallback(
    async (fileList) => {
      const incoming = Array.from(fileList);

      // Add all files in loading state
      const entries = incoming.map((f) => ({
        name: f.name,
        status: 'loading',
        error: null,
      }));
      setFiles((prev) => [...prev, ...entries]);

      // Extract text from each file
      const results = await Promise.allSettled(incoming.map(extractText));

      const extractedTexts = [];

      setFiles((prev) => {
        const updated = [...prev];
        const startIndex = updated.length - incoming.length;

        results.forEach((result, i) => {
          const idx = startIndex + i;
          if (result.status === 'fulfilled') {
            updated[idx] = { ...updated[idx], status: 'done' };
            extractedTexts.push(`--- ${incoming[i].name} ---\n${result.value}`);
          } else {
            updated[idx] = {
              ...updated[idx],
              status: 'error',
              error: result.reason?.message || 'Failed to read file',
            };
          }
        });
        return updated;
      });

      if (extractedTexts.length > 0) {
        onFilesExtracted(extractedTexts.join('\n\n'));
      }
    },
    [onFilesExtracted]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files;
      if (dropped.length > 0) processFiles(dropped);
    },
    [processFiles]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    // Only fire if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) processFiles(e.target.files);
    e.target.value = ''; // reset so same file can be re-added
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Label */}
      <label
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--cds-text-primary)',
          display: 'block',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop files or click to upload"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        style={{
          border: `2px dashed ${isDragging ? 'var(--cds-interactive)' : 'var(--cds-border-strong-01)'}`,
          borderRadius: '4px',
          backgroundColor: isDragging
            ? 'rgba(15, 98, 254, 0.06)'
            : 'var(--cds-layer-01)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          outline: 'none',
        }}
      >
        <DocumentAdd
          size={32}
          style={{
            color: isDragging ? 'var(--cds-interactive)' : 'var(--cds-icon-secondary)',
            transition: 'color 0.15s',
          }}
        />
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isDragging ? 'var(--cds-interactive)' : 'var(--cds-text-primary)',
            margin: 0,
          }}
        >
          {isDragging ? 'Drop files here' : 'Drag & drop notes files here'}
        </p>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '0.8125rem',
            color: 'var(--cds-text-helper)',
            margin: 0,
          }}
        >
          or click to browse — supports .txt, .md, .docx
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.docx"
          multiple
          onChange={handleInputChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
          }}
        >
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--cds-layer-02)',
                border: `1px solid ${
                  file.status === 'error'
                    ? 'rgba(218, 30, 40, 0.3)'
                    : 'var(--cds-border-subtle-01)'
                }`,
                borderRadius: '4px',
              }}
            >
              {/* Status icon */}
              <span style={{ flexShrink: 0 }}>
                {file.status === 'loading' && (
                  <InlineLoading style={{ width: 16, height: 16 }} />
                )}
                {file.status === 'done' && (
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                )}
                {file.status === 'error' && (
                  <WarningAlt size={16} style={{ color: '#da1e28' }} />
                )}
              </span>

              {/* File icon + name */}
              <DocumentBlank
                size={16}
                style={{ color: 'var(--cds-icon-secondary)', flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '0.8125rem',
                  color:
                    file.status === 'error'
                      ? '#da1e28'
                      : 'var(--cds-text-primary)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={file.error || file.name}
              >
                {file.status === 'error' ? file.error : file.name}
              </span>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                aria-label={`Remove ${file.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--cds-icon-secondary)',
                  padding: '0.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <TrashCan size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
