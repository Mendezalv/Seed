import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { NotificationProvider } from './context/NotificationContext';
import { CotacoesProvider } from './context/CotacoesContext';
import { ToastNotification } from './components/common/ToastNotification';
import { LayoutShell } from './components/layout/LayoutShell';
import { Login } from './pages/Login';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TalhoesGis } from './pages/TalhoesGis';
import { SafrasPlanejamento } from './pages/SafrasPlanejamento';
import { InsumosEstoque } from './pages/InsumosEstoque';
import { Maquinarios } from './pages/Maquinarios';
import { Viabilidade } from './pages/Viabilidade';
import { VigilanciaSanitaria } from './pages/VigilanciaSanitaria';
import { EnergiaEsg } from './pages/EnergiaEsg';
import { Configuracoes } from './pages/Configuracoes';

const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="sync-dot" style={{ width: '12px', height: '12px' }} />
          <span>Carregando ecossistema Seed...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <LayoutShell>
        <Dashboard />
      </LayoutShell>
    );
  }

  return <LandingPage />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="sync-dot" style={{ width: '12px', height: '12px' }} />
          <span>Carregando ecossistema Seed...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SyncProvider>
        <NotificationProvider>
          <CotacoesProvider>
            <BrowserRouter>
              <ToastNotification />
              <Routes>
                {/* Rota Raiz Dinâmica: Landing Page (visitante) ou Dashboard (autenticado) */}
                <Route path="/" element={<RootRoute />} />

                {/* Rotas Públicas */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />

                {/* Rotas Protegidas sob o Layout Shell Unificado */}
                <Route
                  element={
                    <ProtectedRoute>
                      <LayoutShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/talhoes" element={<TalhoesGis />} />
                  <Route path="/safras" element={<SafrasPlanejamento />} />
                  <Route path="/insumos" element={<InsumosEstoque />} />
                  <Route path="/maquinarios" element={<Maquinarios />} />
                  <Route path="/viabilidade" element={<Viabilidade />} />
                  <Route path="/vigilancia" element={<VigilanciaSanitaria />} />
                  <Route path="/energia-esg" element={<EnergiaEsg />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CotacoesProvider>
        </NotificationProvider>
      </SyncProvider>
    </AuthProvider>
  );
};

export default App;
