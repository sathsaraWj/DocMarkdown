import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/testUtils'
import { ExportMenu } from '../ExportMenu'

describe('ExportMenu', () => {
  it('does not show the menu until the trigger is clicked', () => {
    renderWithProviders(<ExportMenu />)
    expect(screen.queryByRole('menu', { name: 'Export format' })).not.toBeInTheDocument()
  })

  it('lists every export format plus Print after clicking the trigger', () => {
    renderWithProviders(<ExportMenu />)
    fireEvent.click(screen.getByRole('button', { name: /^export/i }))
    const menu = screen.getByRole('menu', { name: 'Export format' })
    expect(menu).toBeInTheDocument()

    const items = screen.getAllByRole('menuitem').map((el) => el.textContent ?? '')
    expect(items).toHaveLength(6)
    expect(items.some((text) => /^PDF/.test(text))).toBe(true)
    expect(items.some((text) => /^DOCX/.test(text))).toBe(true)
    expect(items.some((text) => /^HTML/.test(text))).toBe(true)
    expect(items.some((text) => /^Markdown/.test(text))).toBe(true)
    expect(items.some((text) => /Plain text/.test(text))).toBe(true)
    expect(items.some((text) => /^Print/.test(text))).toBe(true)
  })

  it('does not auto-open on initial mount even when an openSignal prop is supplied', () => {
    renderWithProviders(<ExportMenu openSignal={0} />)
    expect(screen.queryByRole('menu', { name: 'Export format' })).not.toBeInTheDocument()
  })

  it('opens the menu when openSignal changes after mount', () => {
    function Harness() {
      const [signal, setSignal] = useState(0)
      return (
        <div>
          <button type="button" onClick={() => setSignal((v) => v + 1)}>
            Trigger shortcut
          </button>
          <ExportMenu openSignal={signal} />
        </div>
      )
    }
    renderWithProviders(<Harness />)
    expect(screen.queryByRole('menu', { name: 'Export format' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Trigger shortcut' }))
    expect(screen.getByRole('menu', { name: 'Export format' })).toBeInTheDocument()
  })
})
