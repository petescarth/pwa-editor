import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('does not display Reconnect to Disk button when permission is not pending', () => {
    render(
      <StatusBar
        line={1}
        column={1}
        language="JavaScript"
        tabSize={4}
        insertSpaces={true}
        isOnline={true}
        permissionPending={false}
      />
    );

    expect(screen.queryByText('Reconnect to Disk')).toBeNull();
  });

  it('displays Reconnect to Disk button when permissionPending is true and triggers callback', () => {
    const onRegrant = vi.fn();

    render(
      <StatusBar
        line={5}
        column={12}
        language="TypeScript"
        tabSize={2}
        insertSpaces={true}
        isOnline={true}
        permissionPending={true}
        onRegrantPermission={onRegrant}
      />
    );

    const button = screen.getByText('Reconnect to Disk');
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(onRegrant).toHaveBeenCalledTimes(1);
  });
});
