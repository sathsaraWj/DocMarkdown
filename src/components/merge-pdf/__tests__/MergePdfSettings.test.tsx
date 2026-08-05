import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { DEFAULT_MERGE_PDF_SETTINGS, type MergePdfOutputMetadata, type MergePdfSettings as MergePdfSettingsType } from '@/types/mergePdf'
import { MergePdfSettings } from '../MergePdfSettings'

function Harness({ suggestedTitle }: { suggestedTitle?: string | null }) {
  const [settings, setSettings] = useState<MergePdfSettingsType>(DEFAULT_MERGE_PDF_SETTINGS)
  return (
    <MergePdfSettings
      settings={settings}
      onFilenameChange={(filename) => setSettings((prev) => ({ ...prev, filename }))}
      onMetadataFieldChange={(field: keyof MergePdfOutputMetadata, value: string) =>
        setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
      }
      suggestedTitle={suggestedTitle}
    />
  )
}

describe('MergePdfSettings', () => {
  it('renders the filename and metadata fields', () => {
    render(<Harness />)
    expect(screen.getByLabelText('Output filename')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Author')).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toBeInTheDocument()
    expect(screen.getByLabelText('Keywords')).toBeInTheDocument()
  })

  it('updates the filename as the user types', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Output filename') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Quarterly Report' } })
    expect(input.value).toBe('Quarterly Report')
  })

  it('shows a suggested title without applying it silently', () => {
    render(<Harness suggestedTitle="Annual Report" />)
    const input = screen.getByLabelText('Title') as HTMLInputElement
    expect(input.value).toBe('')
    expect(input.placeholder).toBe('Annual Report')
    expect(screen.getByText(/use "annual report" from the first file/i)).toBeInTheDocument()
  })

  it('applies the suggested title only when the user clicks the suggestion', () => {
    render(<Harness suggestedTitle="Annual Report" />)
    fireEvent.click(screen.getByText(/use "annual report" from the first file/i))
    const input = screen.getByLabelText('Title') as HTMLInputElement
    expect(input.value).toBe('Annual Report')
  })

  it('disables every field when disabled is set', () => {
    render(
      <MergePdfSettings
        settings={DEFAULT_MERGE_PDF_SETTINGS}
        onFilenameChange={vi.fn()}
        onMetadataFieldChange={vi.fn()}
        disabled
      />,
    )
    expect(screen.getByLabelText('Output filename')).toBeDisabled()
    expect(screen.getByLabelText('Title')).toBeDisabled()
  })
})
