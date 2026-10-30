import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted font (no third-party requests). Latin + Latin Extended cover English, Afrikaans
// and the Latin-script South African languages (e.g. Tshivenda and Sepedi diacritics).
import '@fontsource/open-sans/latin-400.css';
import '@fontsource/open-sans/latin-ext-400.css';
import '@fontsource/open-sans/latin-600.css';
import '@fontsource/open-sans/latin-ext-600.css';
import '@fontsource/open-sans/latin-700.css';
import '@fontsource/open-sans/latin-ext-700.css';
import '@fontsource/open-sans/latin-400-italic.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
