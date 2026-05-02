import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadDocument } from '../lib/api';

export default function UploadZone({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setStatusMessage('Only PDF files are supported');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus(null);

    try {
      const result = await uploadDocument(file, (percent) => {
        setProgress(percent);
      });
      setStatus('success');
      setStatusMessage(`"${file.name}" uploaded successfully!`);
      if (onUploadSuccess) onUploadSuccess(result.document);
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus('error');
      const msg = error.response?.data?.detail || 'Upload failed. Please try again.';
      setStatusMessage(msg);
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--accent-purple)' : 'var(--border-color)'}`,
          borderRadius: '12px',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          background: isDragActive ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-primary)',
          opacity: uploading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.borderColor = 'var(--accent-purple)';
            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'var(--bg-primary)';
          }
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={32} color="var(--accent-purple)" style={{ animation: 'spin-slow 1s linear infinite' }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Processing document...</p>
            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--bg-tertiary)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={22} color="var(--accent-purple)" />
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop PDF here'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            color: status === 'success' ? 'var(--success)' : 'var(--error)',
            animation: 'slide-up 0.3s ease-out',
          }}
        >
          {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {statusMessage}
        </div>
      )}
    </div>
  );
}
