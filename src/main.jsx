import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register PWA Service Worker for offline support & background capabilities
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
