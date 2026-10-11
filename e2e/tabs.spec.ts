import { test, expect } from '@playwright/test';

test.describe('Tab Management', () => {
  test('Close All Tabs', async ({ page }) => {
    await page.goto('/');
    
    // Create multiple tabs
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'File', exact: true }).click();
      await page.getByRole('button', { name: /^New/ }).click();
    }
    
    await expect(page.locator('.group.flex.items-center')).toHaveCount(4);

    // Close all tabs
    await page.getByRole('button', { name: 'File', exact: true }).click();
    await page.getByRole('button', { name: /^Close All/ }).click();

    // Verify only one empty tab remains
    await expect(page.locator('.group.flex.items-center')).toHaveCount(1);
  });

  test('Close Tabs to the Right', async ({ page }) => {
    await page.goto('/');
    
    // Create 3 additional tabs
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'File', exact: true }).click();
      await page.getByRole('button', { name: /^New/ }).click();
    }
    
    const tabs = page.locator('.group.flex.items-center');
    await expect(tabs).toHaveCount(4);

    // Right-click the second tab
    await tabs.nth(1).click({ button: 'right' });

    // Click "Close to the Right"
    await page.getByRole('button', { name: 'Close to the Right' }).click();

    // Verify tabs count is 2 (the first and second)
    await expect(tabs).toHaveCount(2);
  });

  test('Confirm close prompt shows when tab is modified', async ({ page }) => {
    await page.goto('/');
    
    const editor = page.locator('.cm-content');
    await expect(editor).toBeVisible();

    // Type to modify tab
    await editor.click();
    await page.keyboard.type('modified text');
    
    // A circle icon represents "modified" in the tab
    await expect(page.locator('.group.flex.items-center .w-2.h-2.rounded-full')).toBeVisible();

    // Try to close tab
    const tabs = page.locator('.group.flex.items-center');
    await tabs.first().hover();
    await tabs.first().locator('button').click(); // click the X button on the tab

    // Expect the confirm modal
    await expect(page.locator('text=Do you want to save the changes you made to "untitled.txt"?')).toBeVisible();

    // Click "Don't Save"
    await page.getByRole('button', { name: "Don't Save" }).click();

    // Confirm tab is closed (and reset to empty one)
    await expect(editor).toHaveText(''); // Since it's the last tab, it resets
    await expect(page.locator('.group.flex.items-center .w-2.h-2.rounded-full')).not.toBeVisible(); // Not modified
  });
});
