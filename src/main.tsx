import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </BrowserRouter>
)
