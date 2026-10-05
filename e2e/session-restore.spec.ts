import { test, expect } from '@playwright/test';

test.describe('Session Restore and Startup Settings', () => {
  test('restores previous session tabs by default upon page reload', async ({ page }) => {
    await page.goto('/pwa-editor/');

    // Wait for the CodeMirror editor to mount
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Type text into the initial tab
    await editor.click();
    await page.keyboard.type('First tab session text');

    // Create a new tab via File -> New
    await page.getByRole('button', { name: 'File', exact: true }).click();
    await page.getByRole('button', { name: /^New/ }).click();

    // The second tab should now be active
    const tabs = page.locator('.group.flex.items-center');
    await expect(tabs).toHaveCount(2);

    // Type text into the second tab
    await editor.click();
    await page.keyboard.type('Second tab session text');

    // Allow debounced session persistence (500ms) to write to IndexedDB
    await page.waitForTimeout(700);

    // Reload the page to simulate reopening the editor
    await page.reload();

    // Verify both tabs are restored
    await expect(page.locator('.group.flex.items-center')).toHaveCount(2);
    await expect(editor).toContainText('Second tab session text');

    // Switch back to the first tab and verify content
    await tabs.first().click();
    await expect(editor).toContainText('First tab session text');
  });

  test('does not restore previous session when toggle is turned OFF', async ({ page }) => {
    await page.goto('/pwa-editor/');
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Open Settings modal via View -> Settings...
    await page.getByRole('button', { name: 'View', exact: true }).click();
    await page.getByRole('button', { name: 'Settings...', exact: true }).click();

    // Verify Settings modal is open and locate the Startup toggle
    const settingsModal = page.locator('text=Startup');
    await expect(settingsModal).toBeVisible();

    const reopenLabel = page.locator('text=Reopen files from previous session');
    await expect(reopenLabel).toBeVisible();

    // Click the toggle button next to Reopen files
    const toggleButton = page
      .locator('div')
      .filter({ hasText: /^Reopen files from previous session/ })
      .getByRole('button');
    await toggleButton.click();

    // Close Settings modal by clicking the X button in the modal header
    await page.locator('.fixed.inset-0 button:has(svg.lucide-x)').click();
    await expect(settingsModal).not.toBeVisible();

    // Type something in the tab
    await editor.click();
    await page.keyboard.type('Temporary text that should not restore');

    // Wait for debounced write
    await page.waitForTimeout(700);

    // Reload page
    await page.reload();

    // Because restorePreviousSession is OFF, should start with a single fresh untitled tab
    await expect(page.locator('.group.flex.items-center')).toHaveCount(1);
    await expect(editor).not.toContainText('Temporary text that should not restore');
  });

  test('persists the restorePreviousSession setting across page reloads', async ({ page }) => {
    await page.goto('/pwa-editor/');
    await expect(page.locator('.cm-content')).toBeVisible();

    // Open Settings modal
    await page.getByRole('button', { name: 'View', exact: true }).click();
    await page.getByRole('button', { name: 'Settings...', exact: true }).click();

    const toggleButton = page
      .locator('div')
      .filter({ hasText: /^Reopen files from previous session/ })
      .getByRole('button');

    // Toggle setting OFF
    await toggleButton.click();
    await page.locator('.fixed.inset-0 button:has(svg.lucide-x)').click();

    // Reload page
    await page.reload();

    // Re-open Settings modal and verify toggle state is preserved (off = bg-[#3c3c3c])
    await page.getByRole('button', { name: 'View', exact: true }).click();
    await page.getByRole('button', { name: 'Settings...', exact: true }).click();

    const toggleButtonAfterReload = page
      .locator('div')
      .filter({ hasText: /^Reopen files from previous session/ })
      .getByRole('button');
    await expect(toggleButtonAfterReload).toHaveClass(/bg-\[#3c3c3c\]/);
  });
});
