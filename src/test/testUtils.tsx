import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { DocumentProvider } from '@/app/DocumentContext'

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(
    <MemoryRouter>
      <DocumentProvider>{ui}</DocumentProvider>
    </MemoryRouter>,
    options,
  )
}

export * from '@testing-library/react'
