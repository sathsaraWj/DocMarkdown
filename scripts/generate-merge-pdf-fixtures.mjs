// Regenerates the small, safe PDF fixtures used by Merge PDF unit and
// Playwright tests. Run with: node scripts/generate-merge-pdf-fixtures.mjs
// All content is generated programmatically — no real-world or copyrighted
// material is included.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const FIXTURES_DIR = path.resolve(import.meta.dirname, '../e2e/fixtures')

async function drawPage(doc, font, text) {
  const page = doc.addPage([420, 594])
  page.drawText(text, { x: 40, y: 520, size: 24, font, color: rgb(0.1, 0.1, 0.4) })
  return page
}

async function buildSinglePage() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  await drawPage(doc, font, 'Fixture: single page')
  return doc.save()
}

async function buildMultiPage() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (let i = 1; i <= 5; i += 1) {
    await drawPage(doc, font, `Fixture: page ${i} of 5`)
  }
  return doc.save()
}

async function buildWithMetadata() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  await drawPage(doc, font, 'Fixture: with metadata')
  await drawPage(doc, font, 'Fixture: with metadata (page 2)')
  doc.setTitle('Merge PDF Fixture Document')
  doc.setAuthor('DocMarkdown Test Suite')
  doc.setSubject('Automated test fixture')
  doc.setKeywords(['docmarkdown', 'fixture', 'test'])
  doc.setCreationDate(new Date('2024-01-15T00:00:00.000Z'))
  return doc.save()
}

/** A tiny solid-color PNG, generated in-memory — no external image asset. */
function buildTinyPng() {
  // 2x2 red PNG, hand-encoded (valid minimal PNG stream).
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVQIHWP8z8BQz8DAABIcAWX' +
    'gAgH1AAAAAElFTkSuQmCC'
  return Buffer.from(base64, 'base64')
}

async function buildWithImage() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const png = await doc.embedPng(buildTinyPng())
  const page = doc.addPage([420, 594])
  page.drawText('Fixture: with embedded image', {
    x: 40,
    y: 520,
    size: 20,
    font,
    color: rgb(0.1, 0.1, 0.4),
  })
  page.drawImage(png, { x: 40, y: 400, width: 100, height: 100 })
  return doc.save()
}

function buildCorrupt() {
  // Valid-looking header so signature sniffing passes, but no real PDF
  // structure follows — pdf-lib's real parser should reject this.
  return Buffer.from('%PDF-1.7\n%\xe2\xe3\xcf\xd3\nnot a real pdf body, no xref table.\n%%EOF')
}

async function main() {
  writeFileSync(path.join(FIXTURES_DIR, 'pdf-single-page.pdf'), await buildSinglePage())
  writeFileSync(path.join(FIXTURES_DIR, 'pdf-multi-page.pdf'), await buildMultiPage())
  writeFileSync(path.join(FIXTURES_DIR, 'pdf-with-metadata.pdf'), await buildWithMetadata())
  writeFileSync(path.join(FIXTURES_DIR, 'pdf-with-image.pdf'), await buildWithImage())
  writeFileSync(path.join(FIXTURES_DIR, 'pdf-corrupt.pdf'), buildCorrupt())
  console.log('Merge PDF fixtures written to', FIXTURES_DIR)
}

main()
