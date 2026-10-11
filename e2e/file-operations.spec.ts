import { test, expect } from '@playwright/test';

test.describe('File Operations', () => {
  test('New file creates a new tab', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the CodeMirror editor to mount
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Verify initial state
    await expect(page.locator('.group.flex.items-center')).toHaveCount(1);
    await expect(page.locator('.group.flex.items-center').first()).toContainText('untitled.txt');

    // Create a new file via menu
    await page.getByRole('button', { name: 'File', exact: true }).click();
    await page.getByRole('button', { name: /^New/ }).click();

    // Verify a second tab was created
    const tabs = page.locator('.group.flex.items-center');
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(1)).toContainText('untitled.txt');
  });
});
