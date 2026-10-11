import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from '@components';
import { StoreProvider } from './state/store';
import { App } from './App';
import '@ds/design-tokens/build/tokens.css';
import '@ds/components/styles.css';
import './app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
);
