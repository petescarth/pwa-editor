import { test, expect } from '@playwright/test';

test.describe('Editor Workflow', () => {
  test('typing text updates content', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    await editor.click();
    await page.keyboard.type('Hello World');

    await expect(editor).toContainText('Hello World');
  });

  test('toggling word wrap affects editor', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Word wrap should be off initially
    await expect(page.locator('.cm-scroller')).not.toHaveClass(/cm-lineWrapping/);

    // Open settings
    await page.getByRole('button', { name: 'View' }).click();
    await page.getByRole('button', { name: 'Settings...' }).click();

    // Toggle word wrap
    const wordWrapToggle = page.locator('div').filter({ hasText: /^Word Wrap$/ }).getByRole('button');
    await wordWrapToggle.click();

    // Close settings
    await page.locator('.fixed.inset-0 button:has(svg.lucide-x)').click();

    // Verify line wrapping class exists on editor
    await expect(page.locator('.cm-content')).toHaveClass(/cm-lineWrapping/);
  });

  test('toggling spell check affects editor', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Spell check is off by default
    await expect(editor).toHaveAttribute('spellcheck', 'false');

    // Open settings
    await page.getByRole('button', { name: 'View' }).click();
    await page.getByRole('button', { name: 'Settings...' }).click();

    // Toggle spell check
    const spellCheckToggle = page.locator('div').filter({ hasText: /^Spell Check$/ }).getByRole('button');
    await spellCheckToggle.click();

    // Close settings
    await page.locator('.fixed.inset-0 button:has(svg.lucide-x)').click();

    // Verify spellcheck is true
    await expect(editor).toHaveAttribute('spellcheck', 'true');
  });
});
