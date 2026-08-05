import { expect, test } from '@playwright/test'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures')
const SAMPLE_DOCX = path.join(FIXTURES_DIR, 'sample.docx')
const LEGACY_DOC = path.join(FIXTURES_DIR, 'legacy.doc')
const CORRUPT_DOCX = path.join(FIXTURES_DIR, 'corrupt.docx')

async function uploadSample(page: import('@playwright/test').Page) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(SAMPLE_DOCX)

  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('h1')).toHaveText('Sample Report', { timeout: 15_000 })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/word-to-pdf')
})

test('opening the Word to PDF page shows the upload zone and privacy messaging', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /word to pdf converter/i })).toBeVisible()
  await expect(page.getByText(/your files never leave your device/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Browse files', exact: true })).toBeVisible()
})

test('uploading a valid .docx converts it and shows the content in the preview', async ({ page }) => {
  await uploadSample(page)
  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('table')).toBeVisible()
  await expect(preview.locator('a')).toBeVisible()
})

test('changing page orientation updates the preview settings', async ({ page }) => {
  await uploadSample(page)
  const orientationSelect = page.getByLabel('Orientation')
  await orientationSelect.selectOption('landscape')
  await expect(orientationSelect).toHaveValue('landscape')
})

test('enabling "Normalize document styling" reveals template and typography controls', async ({
  page,
}) => {
  await uploadSample(page)
  await expect(page.getByLabel(/font family/i)).toHaveCount(0)

  await page.getByRole('switch', { name: /normalize document styling/i }).click()
  await expect(page.getByLabel('Font family')).toBeVisible()
})

test('exporting PDF produces a non-empty, valid PDF file', async ({ page }) => {
  await uploadSample(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /^export pdf/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  if (filePath) {
    const stats = statSync(filePath)
    expect(stats.size).toBeGreaterThan(0)
    const buffer = readFileSync(filePath)
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  }
})

test('downloading standalone HTML produces a self-contained document', async ({ page }) => {
  await uploadSample(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /download html/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.html$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  if (filePath) {
    const html = readFileSync(filePath, 'utf8')
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Sample Report')
  }
})

test('replacing the document loads the newly chosen file', async ({ page }) => {
  await uploadSample(page)
  await expect(page.getByText('sample.docx')).toBeVisible()

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /replace the current word document/i }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(SAMPLE_DOCX)

  const preview = page.locator('[data-testid="document-paper"] .doc-content')
  await expect(preview.locator('h1')).toHaveText('Sample Report', { timeout: 15_000 })
})

test('rejects a legacy .doc file with a clear error message', async ({ page }) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(LEGACY_DOC)

  await expect(page.getByRole('alert')).toContainText(/save the document as \.docx/i)
})

test('rejects an oversized file with a clear error message', async ({ page }) => {
  const oversized = Buffer.alloc(11 * 1024 * 1024, 1)
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'oversized.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: oversized,
  })

  await expect(page.getByRole('alert')).toContainText(/upload limit/i)
})

test('reports a friendly error for a corrupt document', async ({ page }) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(CORRUPT_DOCX)

  await expect(page.getByRole('alert')).toContainText(/could not be read/i)
})

test('clearing the document returns to the empty upload state', async ({ page }) => {
  await uploadSample(page)

  await page.getByRole('button', { name: /clear the current word document/i }).click()
  await expect(page.getByText(/clear this document\?/i)).toBeVisible()
  await page.getByRole('button', { name: /^clear$/i }).click()

  await expect(page.getByRole('button', { name: 'Browse files', exact: true })).toBeVisible()
  await expect(page.getByText('sample.docx')).toHaveCount(0)
})
