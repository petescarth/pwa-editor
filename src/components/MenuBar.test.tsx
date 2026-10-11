import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MenuBar } from './MenuBar';
import { vi, describe, it, expect } from 'vitest';

describe('MenuBar', () => {
  it('renders menus and triggers actions', () => {
    const mockActions = {
      onNewFile: vi.fn(),
      onOpenFile: vi.fn(),
      onSave: vi.fn(),
      onSaveAs: vi.fn(),
      onCloseTab: vi.fn(),
      onCloseAllTabs: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onCut: vi.fn(),
      onCopy: vi.fn(),
      onPaste: vi.fn(),
      onSelectAll: vi.fn(),
      onDuplicateLine: vi.fn(),
      onToggleLineNumbers: vi.fn(),
      onToggleWordWrap: vi.fn(),
      onIncreaseFontSize: vi.fn(),
      onDecreaseFontSize: vi.fn(),
      onToggleTheme: vi.fn(),
      onOpenSettings: vi.fn(),
      onFind: vi.fn(),
      onReplace: vi.fn(),
      onGoToLine: vi.fn(),
      onShowShortcuts: vi.fn(),
      onShowAbout: vi.fn(),
      recentFiles: [],
      onOpenRecentFile: vi.fn(),
    } as any;

    render(<MenuBar {...mockActions} />);

    fireEvent.click(screen.getByText('File'));
    expect(screen.getByText('New')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('New'));
    expect(mockActions.onNewFile).toHaveBeenCalled();
  });
});
