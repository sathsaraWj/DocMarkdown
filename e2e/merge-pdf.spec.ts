import { expect, test } from '@playwright/test'
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures')
const SINGLE_PAGE = path.join(FIXTURES_DIR, 'pdf-single-page.pdf')
const MULTI_PAGE = path.join(FIXTURES_DIR, 'pdf-multi-page.pdf')
const WITH_METADATA = path.join(FIXTURES_DIR, 'pdf-with-metadata.pdf')

async function browseFiles(page: import('@playwright/test').Page, files: string | string[]) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(files)
}

async function uploadTwoValidFiles(page: import('@playwright/test').Page) {
  await browseFiles(page, [SINGLE_PAGE, MULTI_PAGE])
  await expect(page.getByText('pdf-single-page.pdf')).toBeVisible()
  await expect(page.getByText('pdf-multi-page.pdf')).toBeVisible()
  await expect(page.getByText('1 page')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('5 pages')).toBeVisible({ timeout: 15_000 })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/merge-pdf')
})

test('opening the Merge PDF page shows the upload zone and privacy messaging', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: /merge pdf files/i })).toBeVisible()
  await expect(page.getByText(/combine multiple pdf files into one document without uploading them anywhere/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Browse files', exact: true })).toBeVisible()
})

test('uploading two valid PDFs displays their page counts', async ({ page }) => {
  await uploadTwoValidFiles(page)
})

test('reverses the file order using the move controls', async ({ page }) => {
  await uploadTwoValidFiles(page)
  await page.getByRole('button', { name: /move pdf-single-page\.pdf down/i }).click()

  const items = page.getByRole('listitem')
  await expect(items.nth(0)).toContainText('pdf-multi-page.pdf')
  await expect(items.nth(1)).toContainText('pdf-single-page.pdf')
})

test('reorders files without drag-and-drop, using move to first/last', async ({ page }) => {
  await browseFiles(page, [SINGLE_PAGE, MULTI_PAGE, WITH_METADATA])
  await expect(page.getByText('pdf-with-metadata.pdf')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: /move pdf-with-metadata\.pdf to first position/i }).click()
  const items = page.getByRole('listitem')
  await expect(items.nth(0)).toContainText('pdf-with-metadata.pdf')

  await page.getByRole('button', { name: /move pdf-with-metadata\.pdf to last position/i }).click()
  await expect(items.nth(2)).toContainText('pdf-with-metadata.pdf')
})

test('sets a custom page range and blocks merging until it is valid', async ({ page }) => {
  await uploadTwoValidFiles(page)

  const customRadios = page.getByLabel('Custom range')
  await customRadios.nth(1).check()
  const rangeInput = page.getByLabel(/page range for pdf-multi-page\.pdf/i)
  await rangeInput.fill('1-3,20')

  await expect(page.getByRole('alert')).toContainText(/beyond this document's last page/i)
  await expect(page.getByRole('button', { name: /merge pdfs/i })).toBeDisabled()

  await rangeInput.fill('2,1')
  await expect(page.getByRole('button', { name: /merge pdfs/i })).toBeEnabled()
})

test('merges the files and downloads a valid, non-empty PDF with the expected page count', async ({
  page,
}) => {
  await uploadTwoValidFiles(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /merge pdfs/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  if (filePath) {
    const stats = statSync(filePath)
    expect(stats.size).toBeGreaterThan(0)

    const buffer = readFileSync(filePath)
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')

    const merged = await PDFDocument.load(buffer)
    expect(merged.getPageCount()).toBe(6)
  }

  await expect(page.getByText('Merge complete', { exact: true })).toBeVisible()
})

test('removes one PDF from the list', async ({ page }) => {
  await uploadTwoValidFiles(page)
  await page.getByRole('button', { name: /remove pdf-single-page\.pdf/i }).click()
  await expect(page.getByRole('list').getByText('pdf-single-page.pdf')).toHaveCount(0)
  await expect(page.getByRole('list').getByText('pdf-multi-page.pdf')).toBeVisible()
})

test('adds another PDF after the initial selection', async ({ page }) => {
  await uploadTwoValidFiles(page)

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Add more files to the merge' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(WITH_METADATA)

  await expect(page.getByRole('list').getByText('pdf-with-metadata.pdf')).toBeVisible({
    timeout: 15_000,
  })
})

test('rejects a non-PDF file with a clear error while keeping valid files', async ({ page }) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise

  const tempTextFile = path.join(os.tmpdir(), `docmarkdown-merge-not-a-pdf-${Date.now()}.txt`)
  writeFileSync(tempTextFile, 'not a pdf')
  await fileChooser.setFiles([SINGLE_PAGE, tempTextFile])

  await expect(page.getByRole('alert')).toContainText(/only pdf files are supported/i)
  await expect(page.getByText('pdf-single-page.pdf')).toBeVisible()
})

test('rejects an oversized file with a clear error message', async ({ page }) => {
  const oversizedPath = path.join(os.tmpdir(), `docmarkdown-merge-oversized-${Date.now()}.pdf`)
  const oversized = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(51 * 1024 * 1024, 1)])
  writeFileSync(oversizedPath, oversized)

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Browse files', exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(oversizedPath)

  await expect(page.getByRole('alert')).toContainText(/individual file limit/i)
})

test('handles duplicate filenames as distinct entries', async ({ page }) => {
  await browseFiles(page, [SINGLE_PAGE, SINGLE_PAGE])
  await expect(page.getByRole('list').getByText('pdf-single-page.pdf')).toHaveCount(2, {
    timeout: 15_000,
  })
})

test('clears all files after confirmation', async ({ page }) => {
  await uploadTwoValidFiles(page)
  await page.getByRole('button', { name: /clear all selected pdf files/i }).click()
  await expect(page.getByText(/clear all files\?/i)).toBeVisible()
  await page.getByRole('button', { name: /^clear all$/i }).click()

  await expect(page.getByRole('button', { name: 'Browse files', exact: true })).toBeVisible()
  await expect(page.getByRole('list')).toHaveCount(0)
})
