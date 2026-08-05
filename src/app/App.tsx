import { BrowserRouter } from 'react-router-dom'

import { DocumentProvider } from './DocumentContext'
import { AppRouter } from './router'

function App() {
  return (
    <DocumentProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRouter />
      </BrowserRouter>
    </DocumentProvider>
  )
}

export default App
