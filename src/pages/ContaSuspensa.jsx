import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function ContaSuspensa() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darker p-6">
      <div className="w-full max-w-md bg-brand-card border border-brand-red rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Conta suspensa</h1>
        <p className="text-brand-muted mb-6">
          O acesso da sua empresa foi temporariamente suspenso por falta de pagamento.
          Por favor, entre em contacto com o suporte para regularizar.
        </p>
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-brand-green text-brand-dark font-bold hover:bg-brand-greenD transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
}