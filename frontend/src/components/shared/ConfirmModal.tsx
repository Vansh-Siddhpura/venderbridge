interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  isOpen = false,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal__overlay">
      <div className="confirm-modal">
        <h3 className="confirm-modal__title">{title || 'Confirm'}</h3>
        <p className="confirm-modal__message">{message || 'Are you sure?'}</p>
        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
