import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Building2,
  Users,
  CreditCard,
  GitCompare,
  Settings,
  FileText,
} from 'lucide-react';

export function Sidebar() {
  const { perfil, recursosPlano } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);
  const temConsiliacao = recursosPlano?.consiliacao === true;

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/lancamentos', label: 'Lançamentos', icon: PlusCircle },
    { to: '/extrato', label: 'Extrato', icon: ListOrdered },
    ...(temConsiliacao
      ? [{ to: '/consiliacao', label: 'Consiliação', icon: GitCompare }]
      : []),
    ...(isAdmin
      ? [
          { to: '/pedidos', label: 'Pedidos', icon: FileText },
          { to: '/empresas', label: 'Empresas', icon: Building2 },
          { to: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
        ]
      : []),
    { to: '/utilizadores', label: 'Utilizadores', icon: Users },
    { to: '/perfil-empresa', label: 'Perfil da empresa', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-brand-darker border-r border-brand-border p-5">
      <div className="mb-8 flex justify-center">
        <img
          src="/logo-horizontal.svg"
          alt="MeuGestor"
          className="w-full max-w-[200px]"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition ${
                isActive
                  ? 'bg-brand-green/15 text-brand-green font-semibold'
                  : 'text-brand-muted hover:bg-brand-green/5 hover:text-brand-text'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-brand-border text-xs text-brand-subtle">
        MeuGestor v1.0
      </div>
    </aside>
  );
}