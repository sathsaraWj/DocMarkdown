import { expect, test } from '@playwright/test'
import { statSync } from 'node:fs'

test('exporting PDF produces a non-empty, valid PDF file', async ({ page }) => {
  await page.goto('/')

  const editor = page.getByRole('textbox', { name: /markdown source/i })
  await editor.click()
  await editor.press('Control+A')
  await editor.fill('# PDF Export Smoke Test\n\nSome body text.\n\n- item one\n- item two')

  await page.getByRole('button', { name: /^export/i }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('menuitem', { name: /^pdf\b/i }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  if (filePath) {
    const stats = statSync(filePath)
    expect(stats.size).toBeGreaterThan(0)

    const buffer = await import('node:fs').then((fs) => fs.readFileSync(filePath))
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-')
  }
})
