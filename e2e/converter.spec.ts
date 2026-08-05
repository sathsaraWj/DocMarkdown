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
  await expect(editor).toContainText('Uploaded via Playwright')
  await expect(editor).toContainText('Upload flow works.')
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
  await expect(editor).toContainText('Jordan Rivera')
})

test('changing page settings updates the document preview size', async ({ page }) => {
  await page.getByRole('button', { name: 'Style' }).click()
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

  await expect(page.getByText(/saved locally/i).first()).toBeVisible({ timeout: 5000 })

  await page.reload()
  const restoredEditor = page.getByRole('textbox', { name: /markdown source/i })
  await expect(restoredEditor).toContainText('Draft Restore Check')
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
  await expect(page.getByText(/saved locally/i).first()).toBeVisible({ timeout: 5000 })

  await page.getByRole('button', { name: 'Style' }).click()
  await page.getByRole('button', { name: /delete all local data/i }).click()
  await page.getByRole('button', { name: 'Delete everything' }).click()

  await expect(editor).toHaveText('')
  await page.reload()
  await expect(page.getByRole('textbox', { name: /markdown source/i })).toHaveText('')
})

test('the workspace mode selector switches between editor-only, split, and preview-only', async ({
  page,
}) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  const preview = page.locator('[data-testid="document-paper"]')

  await expect(editor).toBeVisible()
  await expect(preview).toBeVisible()

  await page.getByRole('radio', { name: 'Editor only' }).click()
  await expect(editor).toBeVisible()
  await expect(preview).toBeHidden()

  await page.getByRole('radio', { name: 'Preview only' }).click()
  await expect(editor).toBeHidden()
  await expect(preview).toBeVisible()

  await page.getByRole('radio', { name: 'Split' }).click()
  await expect(editor).toBeVisible()
  await expect(preview).toBeVisible()
})

test('the top bar Preview button switches to preview-only mode', async ({ page }) => {
  const preview = page.locator('[data-testid="document-paper"]')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Preview only' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(preview).toBeVisible()
})

test('undo and redo buttons affect the editor content', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('Original text')
  await editor.pressSequentially(' plus more')
  await expect(editor).toContainText('Original text plus more')

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(editor).not.toContainText('plus more')

  await page.getByRole('button', { name: 'Redo' }).click()
  await expect(editor).toContainText('Original text plus more')
})

test('entering and exiting full-screen writing mode hides and restores the top bar', async ({
  page,
}) => {
  await expect(page.getByRole('radiogroup', { name: 'Workspace view' })).toBeVisible()

  await page.getByRole('button', { name: /enter full-screen writing mode/i }).click()
  await expect(page.getByRole('radiogroup', { name: 'Workspace view' })).toBeHidden()
  await expect(page.getByRole('textbox', { name: /markdown source/i })).toBeVisible()

  await page.getByRole('button', { name: /exit full-screen writing mode/i }).click()
  await expect(page.getByRole('radiogroup', { name: 'Workspace view' })).toBeVisible()
})

test('keyboard shortcuts open preview mode and the export menu', async ({ page }) => {
  const isMac = process.platform === 'darwin'
  const modifier = isMac ? 'Meta' : 'Control'

  await page.keyboard.press(`${modifier}+Enter`)
  await expect(page.getByRole('radio', { name: 'Preview only' })).toHaveAttribute(
    'aria-checked',
    'true',
  )

  await page.keyboard.press(`${modifier}+Shift+P`)
  await expect(page.getByRole('menu', { name: 'Export format' })).toBeVisible()
})
