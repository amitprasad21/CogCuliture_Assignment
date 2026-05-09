import { test, expect } from '@playwright/test';

test.describe('Fact Check Agent E2E Tests', () => {
  test('should load the homepage and display the upload section', async ({ page }) => {
    await page.goto('/');
    
    // Verify header
    await expect(page.locator('text=Veritas AI')).toBeVisible();
    await expect(page.locator('text=Truth, verified at scale.')).toBeVisible();
    
    // Verify upload section
    await expect(page.locator('text=Upload Document for Verification')).toBeVisible();
    await expect(page.locator('text=Browse Files')).toBeVisible();
  });

  test('should display file error for non-PDF files', async ({ page }) => {
    await page.goto('/');
    
    // Listen for toast error
    const toastMessage = page.locator('.sonner-toast');
    
    // Upload a dummy text file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('text=Browse Files').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is a text file')
    });

    // Check if error toast is shown
    await expect(page.locator('text=Invalid file type. Please upload a PDF file.')).toBeVisible();
  });
});
