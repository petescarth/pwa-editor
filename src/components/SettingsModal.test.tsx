import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';
import { DEFAULT_SETTINGS } from '../lib/db';

describe('SettingsModal', () => {
  it('renders the Startup section and restorePreviousSession toggle', () => {
    const onUpdateSettings = vi.fn();
    const onClose = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={onClose}
        settings={DEFAULT_SETTINGS}
        onUpdateSettings={onUpdateSettings}
      />
    );

    expect(screen.getByText('Startup')).toBeDefined();
    expect(screen.getByText('Reopen files from previous session')).toBeDefined();
    expect(
      screen.getByText('Automatically restore open tabs when starting the editor')
    ).toBeDefined();
  });

  it('triggers onUpdateSettings when toggling restorePreviousSession', () => {
    const onUpdateSettings = vi.fn();
    const onClose = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={onClose}
        settings={DEFAULT_SETTINGS}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const toggleContainer = screen.getByText('Reopen files from previous session').closest('div')!.parentElement!;
    const toggleButton = toggleContainer.querySelector('button')!;

    fireEvent.click(toggleButton);

    expect(onUpdateSettings).toHaveBeenCalledWith({ restorePreviousSession: false });
  });

  it('shows inactive toggle style when restorePreviousSession is false', () => {
    const onUpdateSettings = vi.fn();
    const onClose = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={onClose}
        settings={{ ...DEFAULT_SETTINGS, restorePreviousSession: false }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const toggleContainer = screen.getByText('Reopen files from previous session').closest('div')!.parentElement!;
    const toggleButton = toggleContainer.querySelector('button')!;

    expect(toggleButton.className).toContain('bg-[#3c3c3c]');
  });
});
