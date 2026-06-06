
import { AlertTriangle } from 'lucide-react';

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

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-black text-white hover:bg-slate-900 border border-black focus:ring-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-black dark:text-slate-200">
                <AlertTriangle size={20} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-elevated px-6 py-4 flex items-center justify-end gap-3 border-t border-default">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold rounded-md border border-default text-primary hover:bg-primary-light transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${confirmBtnClass}`}
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
