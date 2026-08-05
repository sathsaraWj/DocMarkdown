import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/testUtils'
import { SettingsPanel } from '../SettingsPanel'

describe('SettingsPanel', () => {
  it('renders every settings section', () => {
    renderWithProviders(<SettingsPanel />)
    expect(screen.getByText('Template')).toBeInTheDocument()
    expect(screen.getByText('Page')).toBeInTheDocument()
    expect(screen.getByText('Typography')).toBeInTheDocument()
    expect(screen.getByText('Colors')).toBeInTheDocument()
    expect(screen.getByText('Document metadata')).toBeInTheDocument()
    expect(screen.getByText(/header & footer/i)).toBeInTheDocument()
    expect(screen.getByText('Content options')).toBeInTheDocument()
    expect(screen.getByText('Manage settings')).toBeInTheDocument()
  })

  it('marks Clean as the selected template by default', () => {
    renderWithProviders(<SettingsPanel />)
    expect(screen.getByRole('button', { name: 'Clean' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the selected template on click', () => {
    renderWithProviders(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Technical' }))
    expect(screen.getByRole('button', { name: 'Technical' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Clean' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates the document title field', () => {
    renderWithProviders(<SettingsPanel />)
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'My Report' } })
    expect(titleInput).toHaveValue('My Report')
  })

  it('switches page size and orientation', () => {
    renderWithProviders(<SettingsPanel />)
    const sizeSelect = screen.getByLabelText('Page size') as HTMLSelectElement
    fireEvent.change(sizeSelect, { target: { value: 'Letter' } })
    expect(sizeSelect.value).toBe('Letter')
  })

  it('switching to a custom margin sets the preset to custom', () => {
    renderWithProviders(<SettingsPanel />)
    const topMargin = screen.getByLabelText(/top \(mm\)/i) as HTMLInputElement
    fireEvent.change(topMargin, { target: { value: '42' } })
    expect((screen.getByLabelText('Margins') as HTMLSelectElement).value).toBe('custom')
  })

  it('overriding a color shows the current template swatch and a reset action', () => {
    renderWithProviders(<SettingsPanel />)
    const accentInput = screen.getByLabelText('Accent') as HTMLInputElement
    // Clean template's default accent color.
    expect(accentInput.value).toBe('#3b66f5')

    fireEvent.change(accentInput, { target: { value: '#ff0000' } })
    expect(accentInput.value).toBe('#ff0000')
    expect(screen.getByRole('button', { name: /reset to template/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset to template/i }))
    expect((screen.getByLabelText('Accent') as HTMLInputElement).value).toBe('#3b66f5')
  })

  it('opens a confirmation dialog before resetting settings', () => {
    renderWithProviders(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }))
    expect(screen.getByText(/reset settings to defaults\?/i)).toBeInTheDocument()
  })

  it('opens a confirmation dialog before deleting local data', () => {
    renderWithProviders(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /delete all local data/i }))
    expect(screen.getByText(/delete all local data\?/i)).toBeInTheDocument()
  })
})
