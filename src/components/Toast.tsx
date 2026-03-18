import { useToast } from '../hooks/useToast';

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-[#1e1e1e] border-[#007acc] text-[#cccccc]',
  warning: 'bg-[#1e1e1e] border-yellow-400 text-yellow-300',
  error: 'bg-[#1e1e1e] border-red-500 text-red-400',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2 px-4 py-3 rounded border-l-4 shadow-lg pointer-events-auto text-sm whitespace-pre-wrap ${TYPE_STYLES[toast.type] ?? TYPE_STYLES.info}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-2 text-[#858585] hover:text-[#cccccc] shrink-0 leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
