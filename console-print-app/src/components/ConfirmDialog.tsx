import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="
          relative w-full max-w-sm bg-white rounded-2xl shadow-xl
          border border-stone-200/60 p-6
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
            <p className="text-sm text-stone-500 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg text-stone-600 font-medium
              hover:bg-stone-100 transition-colors duration-150 cursor-pointer
            "
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="
              px-4 py-2 rounded-lg bg-red-500 text-white font-medium
              hover:bg-red-600 transition-colors duration-150 cursor-pointer
            "
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
