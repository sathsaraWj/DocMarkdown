import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/testUtils'
import { ThemeSwitcher } from '../ThemeSwitcher'

describe('ThemeSwitcher', () => {
  it('renders light, dark, and system options', () => {
    renderWithProviders(<ThemeSwitcher />)
    expect(screen.getByRole('radio', { name: 'Light theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Match system theme' })).toBeInTheDocument()
  })

  it('marks system as selected by default', () => {
    renderWithProviders(<ThemeSwitcher />)
    expect(screen.getByRole('radio', { name: 'Match system theme' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('switches selection and applies the dark class to the document root', () => {
    renderWithProviders(<ThemeSwitcher />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark theme' }))
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('switches to light and removes the dark class', () => {
    renderWithProviders(<ThemeSwitcher />)
    fireEvent.click(screen.getByRole('radio', { name: 'Dark theme' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Light theme' }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
