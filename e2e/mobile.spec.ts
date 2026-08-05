import { expect, test } from '@playwright/test'

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
