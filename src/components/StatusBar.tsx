import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  line: number;
  column: number;
  language: string;
  tabSize: number;
  insertSpaces: boolean;
  isOnline: boolean;
  permissionPending?: boolean;
  onRegrantPermission?: () => void;
}

export function StatusBar({
  line,
  column,
  language,
  tabSize,
  insertSpaces,
  isOnline,
  permissionPending,
  onRegrantPermission,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between bg-[#007acc] text-white text-xs px-2 py-1">
      <div className="flex items-center gap-4">
        <span>
          Ln {line}, Col {column}
        </span>
        {permissionPending && onRegrantPermission && (
          <button
            onClick={onRegrantPermission}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded transition-colors text-xs font-medium cursor-pointer"
            title="File disk access expired. Click to grant permission and connect."
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reconnect to Disk</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>{insertSpaces ? `Spaces: ${tabSize}` : `Tab Size: ${tabSize}`}</span>
        <span>UTF-8</span>
        <span>{language}</span>
        <span
          className="flex items-center gap-1"
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
        </span>
      </div>
    </div>
  );
}
