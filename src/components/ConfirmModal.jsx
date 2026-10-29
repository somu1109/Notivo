import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true,
  icon: Icon = Trash2
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="confirm-modal-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header with Icon, Title, and Close Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isDanger ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-yellow-soft)',
              border: isDanger ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid var(--color-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDanger ? '#EF4444' : '#1C1C1E',
              flexShrink: 0
            }}>
              <Icon size={19} strokeWidth={1.8} />
            </div>
            <div>
              <h3 
                id="confirm-modal-title" 
                style={{ 
                  fontSize: '1.08rem', 
                  fontWeight: 600, 
                  color: 'var(--color-text-main)', 
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.25
                }}
              >
                {title}
              </h3>
            </div>
          </div>

          <button 
            type="button" 
            className="round-btn" 
            onClick={onClose} 
            title="Close" 
            aria-label="Close modal"
            style={{ width: '28px', height: '28px', padding: 0, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <p style={{ 
          fontSize: '0.86rem', 
          color: 'var(--color-text-muted)', 
          lineHeight: 1.45,
          margin: 0
        }}>
          {message}
        </p>

        {/* Actions Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '8px 18px', fontSize: '0.84rem' }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ padding: '8px 20px', fontSize: '0.84rem' }}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
