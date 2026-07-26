/**
 * ImpactGuru - DDT Case Summary Generator
 * Author: Sakshi
 * Repository: https://github.com/your-username/ddt-summary-generator
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
