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
  UserRound,
} from 'lucide-react';

export function BottomNav() {
  const { perfil, recursosPlano } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);
  const temConciliacao = recursosPlano?.conciliacao === true;

  const links = [
    { to: '/', label: 'Início', icon: LayoutDashboard, end: true },
    { to: '/lancamentos', label: 'Lançar', icon: PlusCircle },
    { to: '/extrato', label: 'Extrato', icon: ListOrdered },
    ...(temConciliacao
      ? [{ to: '/conciliacao', label: 'Conciliar', icon: GitCompare }]
      : []),
    ...(isAdmin
      ? [
          { to: '/empresas', label: 'Empresas', icon: Building2 },
          { to: '/pagamentos', label: 'Pagar', icon: CreditCard },
        ]
      : [{ to: '/utilizadores', label: 'Equipa', icon: Users }]),
    { to: '/vendedores', label: 'Vendedores', icon: UserRound },
    { to: '/perfil-empresa', label: 'Empresa', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-darker border-t border-brand-border flex justify-around py-2 z-40">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium transition ${
              isActive ? 'text-brand-green' : 'text-brand-subtle'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}