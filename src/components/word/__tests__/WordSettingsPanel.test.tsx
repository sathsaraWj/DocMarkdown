import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { DEFAULT_WORD_CONVERSION_SETTINGS, type WordConversionSettings } from '@/types/word'
import { WordSettingsPanel } from '../WordSettingsPanel'

function Harness() {
  const [settings, setSettings] = useState<WordConversionSettings>(DEFAULT_WORD_CONVERSION_SETTINGS)
  return (
    <WordSettingsPanel html="<p>content</p>" ready settings={settings} onChange={setSettings} />
  )
}

describe('WordSettingsPanel', () => {
  it('hides template/typography controls until "Normalize document styling" is enabled', () => {
    render(<Harness />)
    expect(screen.queryByText('Template')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Font family')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: /normalize document styling/i }))

    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByLabelText('Font family')).toBeInTheDocument()
  })

  it('always shows page settings and the document title field', () => {
    render(<Harness />)
    expect(screen.getByText('Page')).toBeInTheDocument()
    expect(screen.getByLabelText(/document title \(used for the pdf file name\)/i)).toBeInTheDocument()
  })

  it('reveals image quality only once compression is enabled', () => {
    render(<Harness />)
    expect(screen.queryByLabelText('Image quality')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('switch', { name: /compress images/i }))
    expect(screen.getByLabelText('Image quality')).toBeInTheDocument()
  })
})
