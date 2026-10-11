import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FindReplace } from './FindReplace';
import { vi, describe, it, expect } from 'vitest';

describe('FindReplace', () => {
  it('renders Find and Replace controls', () => {
    const onClose = vi.fn();

    render(
      <FindReplace
        editorView={null} // Null is fine for a basic render test
        isOpen={true}
        showReplace={true}
        onClose={onClose}
      />
    );

    expect(screen.getByPlaceholderText('Find')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Replace')).toBeInTheDocument();
  });
});
