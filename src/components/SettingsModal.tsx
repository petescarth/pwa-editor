import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { EditorSettings } from '../lib/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (settings: Partial<EditorSettings>) => void;
}

const FONT_FAMILIES = [
  'JetBrains Mono, Consolas, Monaco, monospace',
  'Consolas, Monaco, monospace',
  'Monaco, Menlo, monospace',
  'Fira Code, monospace',
  'Source Code Pro, monospace',
  'Ubuntu Mono, monospace',
  'monospace',
];

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    onUpdateSettings({ [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-medium text-[#cccccc] mb-3">Editor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#858585] mb-1">
                    Font Family
                  </label>
                  <select
                    value={localSettings.fontFamily}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                    className="w-full bg-[#3c3c3c] text-white text-sm px-3 py-2 rounded border border-[#3c3c3c] focus:border-[#007acc] focus:outline-none"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font} value={font}>
                        {font.split(',')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#858585] mb-1">
                    Font Size: {localSettings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={localSettings.fontSize}
                    onChange={(e) =>
                      handleChange('fontSize', parseInt(e.target.value))
                    }
                    className="w-full accent-[#007acc]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#858585] mb-1">
                    Tab Size: {localSettings.tabSize}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={localSettings.tabSize}
                    onChange={(e) =>
                      handleChange('tabSize', parseInt(e.target.value))
                    }
                    className="w-full accent-[#007acc]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cccccc]">
                    Insert Spaces (instead of tabs)
                  </label>
                  <button
                    onClick={() =>
                      handleChange('insertSpaces', !localSettings.insertSpaces)
                    }
                    className={`w-10 h-5 rounded-full transition-colors ${
                      localSettings.insertSpaces
                        ? 'bg-[#007acc]'
                        : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.insertSpaces
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cccccc]">Line Numbers</label>
                  <button
                    onClick={() =>
                      handleChange('lineNumbers', !localSettings.lineNumbers)
                    }
                    className={`w-10 h-5 rounded-full transition-colors ${
                      localSettings.lineNumbers
                        ? 'bg-[#007acc]'
                        : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.lineNumbers
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cccccc]">Word Wrap</label>
                  <button
                    onClick={() =>
                      handleChange('wordWrap', !localSettings.wordWrap)
                    }
                    className={`w-10 h-5 rounded-full transition-colors ${
                      localSettings.wordWrap ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.wordWrap
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-[#cccccc] mb-3">
                Auto Save
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[#cccccc]">
                    Enable Auto Save
                  </label>
                  <button
                    onClick={() =>
                      handleChange('autoSave', !localSettings.autoSave)
                    }
                    className={`w-10 h-5 rounded-full transition-colors ${
                      localSettings.autoSave ? 'bg-[#007acc]' : 'bg-[#3c3c3c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localSettings.autoSave
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {localSettings.autoSave && (
                  <div>
                    <label className="block text-sm text-[#858585] mb-1">
                      Auto Save Interval:{' '}
                      {localSettings.autoSaveInterval / 1000}s
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="120000"
                      step="5000"
                      value={localSettings.autoSaveInterval}
                      onChange={(e) =>
                        handleChange(
                          'autoSaveInterval',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full accent-[#007acc]"
                    />
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-[#cccccc] mb-3">Theme</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('theme', 'dark')}
                  className={`flex-1 px-4 py-2 rounded text-sm ${
                    localSettings.theme === 'dark'
                      ? 'bg-[#007acc] text-white'
                      : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#454545]'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => handleChange('theme', 'light')}
                  className={`flex-1 px-4 py-2 rounded text-sm ${
                    localSettings.theme === 'light'
                      ? 'bg-[#007acc] text-white'
                      : 'bg-[#3c3c3c] text-[#cccccc] hover:bg-[#454545]'
                  }`}
                >
                  Light
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
