import { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, Loader2 } from 'lucide-react';
import { getDocuments, deleteDocument } from '../lib/api';
import UploadZone from './UploadZone';

export default function DocumentPanel({ onDocumentSelect, activeDocId, refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      const sortedDocs = (data.documents || []).sort((a, b) => 
        new Date(b.upload_time) - new Date(a.upload_time)
      );
      setDocuments(sortedDocs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (deleting) return;

    setDeleting(docId);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadSuccess = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
    if (onDocumentSelect) onDocumentSelect(doc.id);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '16px',
        }}
      >
        Documents
      </h2>

      {/* Upload Zone */}
      <UploadZone onUploadSuccess={handleUploadSuccess} />

      {/* Document List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                borderRadius: '10px',
                height: '60px',
              }}
              className="animate-shimmer"
            />
          ))
        ) : documents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p>No documents yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Upload a PDF to get started</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onDocumentSelect && onDocumentSelect(doc.id)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: `1px solid ${activeDocId === doc.id ? 'var(--accent-purple)' : 'transparent'}`,
                background: activeDocId === doc.id ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slide-up 0.3s ease-out',
              }}
              onMouseEnter={(e) => {
                if (activeDocId !== doc.id) {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeDocId !== doc.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: activeDocId === doc.id
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(124, 58, 237, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} color={activeDocId === doc.id ? 'white' : 'var(--accent-purple)'} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {doc.filename}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px',
                  }}
                >
                  <Clock size={10} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {formatTime(doc.upload_time)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {activeDocId === doc.id ? (
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--accent-purple)',
                      fontWeight: 600,
                      background: 'rgba(124, 58, 237, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Active
                  </div>
                ) : (
                  <button
                    onClick={() => onDocumentSelect && onDocumentSelect(doc.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-purple)';
                      e.currentTarget.style.color = 'var(--accent-purple)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    Chat
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deleting === doc.id}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: deleting === doc.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {deleting === doc.id ? (
                    <Loader2 size={14} style={{ animation: 'spin-slow 1s linear infinite' }} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
