import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
  variant = 'default',
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)]">
                <AlertTriangle size={16} />
              </div>
            )}
            <h3 className="text-base font-semibold text-primary">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-shell__icon-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">
          <p className="text-sm text-secondary">{message}</p>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn--sm ${variant === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
