import { createRoot } from 'react-dom/client'
import './i18n/config'  // ← Add this import BEFORE App
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
