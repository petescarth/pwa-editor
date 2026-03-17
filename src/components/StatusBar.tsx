import { Wifi, WifiOff } from 'lucide-react';

interface StatusBarProps {
  line: number;
  column: number;
  language: string;
  tabSize: number;
  insertSpaces: boolean;
  isOnline: boolean;
}

export function StatusBar({
  line,
  column,
  language,
  tabSize,
  insertSpaces,
  isOnline,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between bg-[#007acc] text-white text-xs px-2 py-1">
      <div className="flex items-center gap-4">
        <span>
          Ln {line}, Col {column}
        </span>
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
