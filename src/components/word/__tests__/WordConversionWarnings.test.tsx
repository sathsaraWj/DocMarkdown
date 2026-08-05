import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { WordConversionWarnings } from '../WordConversionWarnings'

describe('WordConversionWarnings', () => {
  it('lists parser-reported warning messages', () => {
    render(
      <WordConversionWarnings
        warnings={[{ type: 'warning', message: 'Unsupported image type' }]}
      />,
    )
    expect(screen.getByText('Unsupported image type')).toBeInTheDocument()
  })

  it('always shows the standing formatting-limitations disclosure, even with no parser warnings', () => {
    render(<WordConversionWarnings warnings={[]} />)
    expect(screen.getByText(/what might not convert exactly/i)).toBeInTheDocument()
    expect(screen.getByText('SmartArt')).toBeInTheDocument()
    expect(screen.getByText('Track changes')).toBeInTheDocument()
  })

  it('never claims the result is pixel-perfect', () => {
    render(<WordConversionWarnings warnings={[]} />)
    expect(screen.queryByText(/pixel-perfect/i)).toHaveTextContent(/not pixel-perfect/i)
  })
})
