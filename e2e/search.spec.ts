import { test, expect } from '@playwright/test';

test.describe('Search and Replace Workflow', () => {
  test('Find and Replace text', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Type initial text
    await editor.click();
    await page.keyboard.type('apple banana apple');

    // Verify text is present
    await expect(editor).toContainText('apple banana apple');

    // Open Find/Replace using the menu
    await page.getByRole('button', { name: 'Find', exact: true }).click();
    await page.getByRole('button', { name: 'Replace' }).click();

    // Verify the Find and Replace modal opened
    const findInput = page.getByPlaceholder('Find');
    const replaceInput = page.getByPlaceholder('Replace');
    await expect(findInput).toBeVisible();
    await expect(replaceInput).toBeVisible();

    // Perform replacement
    await findInput.fill('apple');
    await replaceInput.fill('orange');
    
    // Small delay to ensure React state updates CodeMirror search query
    await page.waitForTimeout(100);

    // Use "Replace All" action
    await page.getByTitle('Replace All').click();

    // Verify the editor content updated
    await expect(editor).toContainText('orange banana orange');
  });
});
