import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';

// Auto-registra o Service Worker para cache offline imediato
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('Nova versão do Seed disponível. Atualizando cache de assets...');
  },
  onOfflineReady() {
    console.info('Ecossistema Seed pronto para operação 100% offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
