import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import FullPage from './FullPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FullPage>
      <App />
    </FullPage>
  </StrictMode>,
)
