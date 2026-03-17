import { RefreshCw, X } from 'lucide-react';

interface UpdateNotificationProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({
  isVisible,
  onUpdate,
  onDismiss,
}: UpdateNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50 bg-[#252526] border border-[#007acc] rounded-lg shadow-xl p-4 max-w-sm animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#007acc]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-[#007acc]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white mb-1">
            Update Available
          </h3>
          <p className="text-xs text-[#858585] mb-3">
            A new version of the editor is available. Refresh to update.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpdate}
              className="px-3 py-1 text-xs bg-[#007acc] text-white rounded hover:bg-[#006bb3] transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1 text-xs text-[#858585] hover:text-white transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#858585] hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
