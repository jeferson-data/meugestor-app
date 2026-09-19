import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { LogOut, Building2, ShieldCheck, Eye } from 'lucide-react';

export function TopBar() {
  const { logout } = useAuth();
  const { perfil, empresaAtiva, empresas, trocarEmpresa } = useApp();

  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  // Rótulo do role global para mostrar ao lado do nome
  const roleLabel = {
    admin_programa: 'Admin',
    dono_programa: 'Dono do programa',
    dono_cliente: 'Cliente',
  }[perfil?.role] || '';

  return (
    <header className="bg-brand-card border-b border-brand-border px-4 md:px-6 py-3 flex items-center justify-between gap-4">

      {/* Lado esquerdo: empresa ativa / a ver empresa */}
      <div className="flex items-center gap-3 min-w-0">
        <Building2 className="text-brand-green flex-shrink-0" size={22} />
        <div className="min-w-0">
          <div className="text-xs text-brand-muted uppercase tracking-wide flex items-center gap-1">
            {isAdmin ? (
              <>
                <Eye size={12} /> Empresa em visualização
              </>
            ) : (
              'Empresa ativa'
            )}
          </div>

          {empresas.length > 1 && isAdmin ? (
            <select
              value={empresaAtiva?.id || ''}
              onChange={(e) => {
                const emp = empresas.find((x) => x.id === e.target.value);
                if (emp) trocarEmpresa(emp);
              }}
              className="bg-transparent font-semibold text-brand-text text-base focus:outline-none truncate max-w-[180px] md:max-w-none"
            >
              {empresas.map((e) => (
                <option key={e.id} value={e.id} className="bg-brand-card">
                  {e.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="font-semibold text-brand-text truncate">
              {empresaAtiva?.nome || 'Sem empresa'}
            </div>
          )}
        </div>

        {/* Badge: aviso quando é admin a ver outra empresa */}
        {isAdmin && empresaAtiva && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green bg-brand-green/10 border border-brand-green/30 rounded-full px-2 py-0.5">
            <ShieldCheck size={12} /> Admin
          </span>
        )}
      </div>

      {/* Lado direito: utilizador + logout */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden md:block text-right">
          <div className="text-sm font-medium flex items-center justify-end gap-2">
            {perfil?.nome}
            {roleLabel && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-muted bg-brand-border/40 rounded px-1.5 py-0.5">
                {roleLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-brand-muted">{perfil?.email}</div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-full border border-brand-border text-brand-muted hover:text-brand-red hover:border-brand-red transition"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}