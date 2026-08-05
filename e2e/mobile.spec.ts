import { expect, test } from '@playwright/test'
import path from 'node:path'

test('the converter is usable on a mobile viewport via Editor/Preview/Settings tabs', async ({
  page,
}) => {
  await page.goto('/')

  // Editor tab is active by default; the two-column desktop layout is hidden.
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await expect(editor).toBeVisible()

  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# Mobile Heading\n\nMobile paragraph text.')

  await page.getByRole('tab', { name: 'Preview' }).click()
  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('h1')).toHaveText('Mobile Heading')

  await page.getByRole('tab', { name: 'Settings' }).click()
  await expect(page.getByText('Document settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Page' })).toBeVisible()

  await page.getByRole('tab', { name: 'Editor' }).click()
  await expect(editor).toBeVisible()
  await expect(editor).toHaveValue(/Mobile Heading/)
})

test('the Word to PDF converter is usable on a mobile viewport', async ({ page }) => {
  await page.goto('/word-to-pdf')

  await expect(page.getByRole('heading', { level: 1, name: /word to pdf converter/i })).toBeVisible()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(path.join(import.meta.dirname, 'fixtures', 'sample.docx'))

  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('h1')).toHaveText('Sample Report', { timeout: 15_000 })

  await expect(page.getByText('Conversion settings')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Page' })).toBeVisible()
})

test('the Merge PDF tool is usable on a mobile viewport, including reordering', async ({ page }) => {
  await page.goto('/merge-pdf')

  await expect(page.getByRole('heading', { level: 1, name: /merge pdf files/i })).toBeVisible()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles([
    path.join(import.meta.dirname, 'fixtures', 'pdf-single-page.pdf'),
    path.join(import.meta.dirname, 'fixtures', 'pdf-multi-page.pdf'),
  ])

  await expect(page.getByText('pdf-single-page.pdf')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('pdf-multi-page.pdf')).toBeVisible()

  await page.getByRole('button', { name: /move pdf-single-page\.pdf down/i }).click()
  const items = page.getByRole('listitem')
  await expect(items.nth(0)).toContainText('pdf-multi-page.pdf')

  await expect(page.getByRole('button', { name: /merge pdfs/i })).toBeVisible()
})
