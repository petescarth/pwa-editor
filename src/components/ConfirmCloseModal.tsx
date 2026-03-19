interface ConfirmCloseModalProps {
  /** If null, modal is hidden */
  pendingClose: PendingClose | null;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

export interface PendingClose {
  /** 'single' = one tab, 'batch' = Close Others / Close All / Close to Right */
  type: 'single' | 'batch';
  /** Tab filename for single-tab closures */
  filename?: string;
  /** Number of modified tabs affected for batch closures */
  modifiedCount?: number;
}

export function ConfirmCloseModal({
  pendingClose,
  onSave,
  onDontSave,
  onCancel,
}: ConfirmCloseModalProps) {
  if (!pendingClose) return null;

  const title =
    pendingClose.type === 'single'
      ? `Do you want to save the changes you made to "${pendingClose.filename}"?`
      : `Do you want to save changes to ${pendingClose.modifiedCount} file${pendingClose.modifiedCount !== 1 ? 's' : ''}?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-full max-w-sm p-5">
        <p className="text-sm text-[#cccccc] mb-1">{title}</p>
        <p className="text-xs text-[#858585] mb-5">
          Your changes will be lost if you don't save them.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-[#cccccc] bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded"
          >
            Cancel
          </button>
          <button
            onClick={onDontSave}
            className="px-4 py-1.5 text-sm text-[#cccccc] bg-[#3c3c3c] hover:bg-[#4a4a4a] rounded"
          >
            Don't Save
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1.5 text-sm text-white bg-[#007acc] hover:bg-[#0088e0] rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
