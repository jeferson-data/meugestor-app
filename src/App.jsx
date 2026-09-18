import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Contratar } from './pages/Contratar';
import { Dashboard } from './pages/Dashboard';
import { Lancamentos } from './pages/Lancamentos';
import { Extrato } from './pages/Extrato';
import { Empresas } from './pages/Empresas';
import { Pagamentos } from './pages/Pagamentos';
import { Utilizadores } from './pages/Utilizadores';
import { Vendedores } from './pages/Vendedores';
import { Consiliacao } from './pages/Consiliacao';
import { PerfilEmpresa } from './pages/PerfilEmpresa';
import { Pedidos } from './pages/Pedidos';
import { ContaSuspensa } from './pages/ContaSuspensa';

function RotaProtegida() {
  const { user, loading } = useAuth();
  const { empresaAtiva, perfil } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-darker text-brand-muted">
        A carregar...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);
  if (!isAdmin && empresaAtiva?.status_acesso === 'suspenso') {
    return <ContaSuspensa />;
  }

  return <Layout />;
}

function RotaPublica() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<RotaPublica />} />
      <Route path="/contratar" element={<Contratar />} />
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/extrato" element={<Extrato />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/utilizadores" element={<Utilizadores />} />
        <Route path="/vendedores" element={<Vendedores />} />
        <Route path="/consiliacao" element={<Consiliacao />} />
        <Route path="/perfil-empresa" element={<PerfilEmpresa />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}