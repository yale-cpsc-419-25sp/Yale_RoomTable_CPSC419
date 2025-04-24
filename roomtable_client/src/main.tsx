import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Create the root element and render the App
createRoot(document.getElementById('root')!).render(
  // StrictMode highlights potential problems for us to fix
  <StrictMode>
    <App />
  </StrictMode>,
)
