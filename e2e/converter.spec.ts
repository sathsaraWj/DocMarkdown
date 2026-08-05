import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('typing Markdown updates the live preview', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# Hello Playwright\n\nThis is a **test** paragraph.')

  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('h1')).toHaveText('Hello Playwright')
  await expect(preview.locator('strong')).toHaveText('test')
})

test('uploading a Markdown file loads its content into the editor', async ({ page }) => {
  const filePath = path.join(os.tmpdir(), `docmarkdown-upload-${Date.now()}.md`)
  const content = '# Uploaded via Playwright\n\nUpload flow works.'
  await import('node:fs').then((fs) => fs.writeFileSync(filePath, content))

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /upload a markdown or text file/i }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(filePath)

  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await expect(editor).toHaveValue(content)
})

test('applying a template replaces the editor content and template selection', async ({ page }) => {
  await page.getByRole('link', { name: 'Templates' }).click()
  await expect(page).toHaveURL(/\/templates$/)

  await page
    .locator('article', { hasText: 'Resume' })
    .getByRole('button', { name: 'Use template' })
    .click()

  // The sample document is non-empty, so replacing it requires confirmation.
  await expect(page.getByText(/replace current markdown/i)).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Use template' }).click()

  await expect(page).toHaveURL('/')
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await expect(editor).toHaveValue(/Jordan Rivera/)
})

test('changing page settings updates the document preview size', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()
  const pageSizeSelect = page.getByLabel('Page size')
  await pageSizeSelect.selectOption('Letter')
  await expect(pageSizeSelect).toHaveValue('Letter')

  await page.getByLabel('Orientation').selectOption('landscape')
  await expect(page.getByLabel('Orientation')).toHaveValue('landscape')
})

test('refreshing the page restores the last saved draft', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# Draft Restore Check')

  await expect(page.getByText(/saved locally/i)).toBeVisible({ timeout: 5000 })

  await page.reload()
  const restoredEditor = page.getByRole('textbox', { name: /markdown source/i })
  await expect(restoredEditor).toHaveValue('# Draft Restore Check')
})

test('exporting Markdown downloads a .md file with the source content', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# Export Markdown Test')

  await page.getByRole('button', { name: /^export/i }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: /markdown/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.md$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  if (filePath) {
    const text = readFileSync(filePath, 'utf8')
    expect(text).toContain('# Export Markdown Test')
  }
})

test('exporting HTML downloads a standalone HTML document', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# Export HTML Test')

  await page.getByRole('button', { name: /^export/i }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: /^html\b/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.html$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  if (filePath) {
    const html = readFileSync(filePath, 'utf8')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Export HTML Test')
  }
})

test('deleting local data clears the draft after confirmation', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# About to be deleted')
  await expect(page.getByText(/saved locally/i)).toBeVisible({ timeout: 5000 })

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: /delete all local data/i }).click()
  await page.getByRole('button', { name: 'Delete everything' }).click()

  await expect(editor).toHaveValue('')
  await page.reload()
  await expect(page.getByRole('textbox', { name: /markdown source/i })).toHaveValue('')
})
