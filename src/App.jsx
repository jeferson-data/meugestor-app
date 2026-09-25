import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { EsqueciSenha } from './pages/EsqueciSenha';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { Contratar } from './pages/Contratar';
import { Dashboard } from './pages/Dashboard';
import { Lancamentos } from './pages/Lancamentos';
import { Extrato } from './pages/Extrato';
import { Empresas } from './pages/Empresas';
import { Pagamentos } from './pages/Pagamentos';
import { Utilizadores } from './pages/Utilizadores';
import { Vendedores } from './pages/Vendedores';
import { Conciliacao } from './pages/Conciliacao';
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

  // Bloqueia acesso para empresas suspensas ou arquivadas
  const bloqueada = ['suspenso', 'suspensa', 'arquivada'].includes(
    empresaAtiva?.status_acesso
  );

  if (!isAdmin && bloqueada) {
    return <ContaSuspensa />;
  }

  return <Layout />;
}

// Rota pública que redireciona o usuário logado para o Dashboard.
function RotaPublica() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

// Rota pública sem redirecionamento.
// Necessária para /esqueci-senha e /redefinir-senha: o usuário chega
// pelo link do e-mail já com uma sessão temporária criada pelo Supabase,
// e não pode ser jogado no Dashboard antes de trocar a senha.
function RotaAberta() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-darker text-brand-muted">
        A carregar...
      </div>
    );
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas com redirecionamento se logado */}
      <Route path="/login" element={<RotaPublica />} />

      {/* Públicas sem redirecionamento */}
      <Route element={<RotaAberta />}>
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      </Route>

      {/* Contratar — pública */}
      <Route path="/contratar" element={<Contratar />} />

      {/* Protegidas */}
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/extrato" element={<Extrato />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/utilizadores" element={<Utilizadores />} />
        <Route path="/vendedores" element={<Vendedores />} />
        <Route path="/conciliacao" element={<Conciliacao />} />
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