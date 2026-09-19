import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CreditCard, Lock } from 'lucide-react';

export function Conciliacao() {
  const { empresaAtiva, recursosPlano, plano } = useApp();

  const disponivel = recursosPlano?.conciliacao === true;

  if (!disponivel) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Conciliação Bancária</h1>
        <p className="text-brand-muted mb-6">
          Compare os lançamentos do sistema com o extrato do banco.
        </p>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <Lock className="text-brand-muted mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Recurso indisponível</h2>
          <p className="text-brand-muted text-sm mb-1">
            A conciliação bancária está disponível apenas no <strong>plano Completo</strong>.
          </p>
          <p className="text-brand-subtle text-xs">
            {plano ? `Plano atual: ${plano.nome}` : 'Sem plano ativo.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Conciliação Bancária</h1>
      <p className="text-brand-muted mb-6">
        Compare os lançamentos do sistema com o extrato do banco.
      </p>

      <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <CreditCard className="text-brand-green mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold mb-2">Módulo pronto para receber extratos</h2>
        <p className="text-brand-muted text-sm">
          Em breve poderá importar ficheiros OFX/CSV do seu banco e conciliar
          automaticamente com os lançamentos.
        </p>
      </div>
    </div>
  );
}
