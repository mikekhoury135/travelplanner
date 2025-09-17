import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TravelDataProvider } from './context/TravelDataProvider';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TravelDataProvider>
      <App />
    </TravelDataProvider>
  </StrictMode>,
);
