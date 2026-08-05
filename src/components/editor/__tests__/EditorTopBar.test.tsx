import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/testUtils'
import { EditorTopBar, type MobileTab, type WorkspaceMode } from '../EditorTopBar'

function Harness({
  isDesktop = true,
  initialMode = 'split',
}: {
  isDesktop?: boolean
  initialMode?: WorkspaceMode
}) {
  const [mode, setMode] = useState<WorkspaceMode>(initialMode)
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const onUndo = vi.fn()
  const onRedo = vi.fn()

  return (
    <EditorTopBar
      isDesktop={isDesktop}
      mode={mode}
      onModeChange={setMode}
      mobileTab={mobileTab}
      onMobileTabChange={setMobileTab}
      settingsOpen={settingsOpen}
      onToggleSettings={() => setSettingsOpen((v) => !v)}
      onUndo={onUndo}
      onRedo={onRedo}
      exportOpenSignal={0}
    />
  )
}

describe('EditorTopBar (desktop)', () => {
  it('renders the document title field bound to the document metadata', () => {
    renderWithProviders(<Harness />)
    expect(screen.getByLabelText('Document title')).toBeInTheDocument()
  })

  it('shows the workspace mode selector with the initial mode checked', () => {
    renderWithProviders(<Harness initialMode="split" />)
    expect(screen.getByRole('radio', { name: 'Split' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Editor only' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('switches the active mode when a different option is clicked', () => {
    renderWithProviders(<Harness initialMode="split" />)
    fireEvent.click(screen.getByRole('radio', { name: 'Preview only' }))
    expect(screen.getByRole('radio', { name: 'Preview only' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('toggles the style panel button state', () => {
    renderWithProviders(<Harness />)
    const styleButton = screen.getByRole('button', { name: 'Style' })
    fireEvent.click(styleButton)
    expect(screen.getByRole('button', { name: 'Hide style' })).toBeInTheDocument()
  })

  it('does not render the mobile tablist on desktop', () => {
    renderWithProviders(<Harness isDesktop />)
    expect(screen.queryByRole('tablist', { name: 'Workspace view' })).not.toBeInTheDocument()
  })

  it('opens the more-options menu with Beautify and Copy actions', () => {
    renderWithProviders(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'More options' }))
    expect(screen.getByRole('menuitem', { name: /beautify markdown/i })).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /copy markdown to clipboard/i }),
    ).toBeInTheDocument()
  })
})

describe('EditorTopBar (mobile)', () => {
  it('renders the Write/Preview/Style tablist instead of the mode selector', () => {
    renderWithProviders(<Harness isDesktop={false} />)
    const tablist = screen.getByRole('tablist', { name: 'Workspace view' })
    expect(tablist).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Write' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Style' })).toBeInTheDocument()
  })

  it('does not render the desktop mode selector or preview button on mobile', () => {
    renderWithProviders(<Harness isDesktop={false} />)
    expect(screen.queryByRole('radiogroup', { name: 'Workspace view' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Preview' })).not.toBeInTheDocument()
  })

  it('switches the active mobile tab on click', () => {
    renderWithProviders(<Harness isDesktop={false} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Style' }))
    expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Write' })).toHaveAttribute('aria-selected', 'false')
  })
})
