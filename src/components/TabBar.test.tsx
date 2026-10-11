import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabBar } from './TabBar';
import { vi, describe, it, expect } from 'vitest';

const mockTabs = [
  {
    id: 'tab-1',
    filename: 'test1.txt',
    isModified: false,
    isUnsaved: false,
  },
  {
    id: 'tab-2',
    filename: 'test2.js',
    isModified: true,
    isUnsaved: false,
  }
];

describe('TabBar', () => {
  it('renders tabs and handles clicks', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const onCloseOthers = vi.fn();
    const onCloseAll = vi.fn();
    const onCloseToRight = vi.fn();
    const onReorder = vi.fn();
    const onRename = vi.fn();

    render(
      <TabBar
        tabs={mockTabs as any}
        activeTabId="tab-1"
        onSelectTab={onSelect}
        onCloseTab={onClose}
        onCloseOther={onCloseOthers}
        onCloseAll={onCloseAll}
        onCloseToRight={onCloseToRight}
        onReorderTabs={onReorder}
        onRenameTab={onRename}
      />
    );

    expect(screen.getByText('test1.txt')).toBeInTheDocument();
    expect(screen.getByText('test2.js')).toBeInTheDocument();
    
    // Tab selection
    fireEvent.click(screen.getByText('test2.js'));
    expect(onSelect).toHaveBeenCalledWith('tab-2');
  });
});
