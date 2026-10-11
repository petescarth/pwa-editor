import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandPalette } from './CommandPalette';
import { vi, describe, it, expect } from 'vitest';

describe('CommandPalette', () => {
  it('renders command palette and handles inputs', () => {
    const onClose = vi.fn();
    const commands = [
      { id: '1', label: 'New File', action: vi.fn() },
      { id: '2', label: 'Open File', action: vi.fn() },
    ];

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        commands={commands}
      />
    );

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    
    // Test filter
    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.change(input, { target: { value: 'New' } });
    
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.queryByText('Open File')).not.toBeInTheDocument();
  });
});
