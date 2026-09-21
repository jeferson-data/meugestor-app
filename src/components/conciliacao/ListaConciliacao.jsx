import React from 'react';
import { Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatarCentavos, formatarData } from '../../utils/conciliacao';

const ESTILO_STATUS = {
  sugerido: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    label: 'Sugerido',
    Icone: AlertTriangle,
    cor: 'text-yellow-500',
  },
  conciliado: {
    bg: 'bg-brand-green/10',
    border: 'border-brand-green/40',
    label: 'Conciliado',
    Icone: Check,
    cor: 'text-brand-green',
  },
  sem_par: {
    bg: 'bg-brand-red/10',
    border: 'border-brand-red/40',
    label: 'Sem par',
    Icone: X,
    cor: 'text-brand-red',
  },
};

export function ListaConciliacao({
  pares,
  onConfirmar,
  onRejeitar,
  onConfirmarTodos,
}) {
  const sugeridos = pares.filter((p) => p.status === 'sugerido');
  const conciliados = pares.filter((p) => p.status === 'conciliado');
  const semPar = pares.filter((p) => p.status === 'sem_par');

  return (
    <div className="flex flex-col gap-5">
      {sugeridos.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirmarTodos}
            className="px-4 py-2 rounded-xl bg-brand-green text-white font-semibold text-sm hover:opacity-90 transition"
          >
            Confirmar todos os {sugeridos.length} sugeridos
          </button>
        </div>
      )}

      <Secao titulo="Sugeridos" itens={sugeridos} onConfirmar={onConfirmar} onRejeitar={onRejeitar} />
      <Secao titulo="Conciliados" itens={conciliados} />
      <Secao titulo="Sem par no sistema" itens={semPar} />
    </div>
  );
}

function Secao({ titulo, itens, onConfirmar, onRejeitar }) {
  if (!itens.length) return null;
  return (
    <div>
      <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wide mb-2">
        {titulo} ({itens.length})
      </h3>
      <div className="flex flex-col gap-2">
        {itens.map((par, i) => (
          <LinhaPar
            key={par.item.id || i}
            par={par}
            onConfirmar={onConfirmar}
            onRejeitar={onRejeitar}
          />
        ))}
      </div>
    </div>
  );
}

function LinhaPar({ par, onConfirmar, onRejeitar }) {
  const estilo = ESTILO_STATUS[par.status];
  const { Icone } = estilo;

  return (
    <div
      className={`${estilo.bg} border ${estilo.border} rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icone size={16} className={estilo.cor} />
          <span className={`text-xs font-bold ${estilo.cor}`}>{estilo.label}</span>
          <span className="text-xs text-brand-muted">
            {formatarData(par.item.data)}
          </span>
        </div>
        <p className="text-sm truncate">{par.item.descricao}</p>
        <p className="text-xs text-brand-muted mt-0.5">
          {formatarCentavos(par.item.valor_centavos)}
        </p>
      </div>

      {par.movimentacao && (
        <>
          <ArrowRight size={16} className="text-brand-muted hidden sm:block" />
          <div className="flex-1 min-w-0 sm:text-right">
            <p className="text-xs text-brand-muted mb-1">
              Lançamento no sistema
            </p>
            <p className="text-sm truncate">{par.movimentacao.descricao}</p>
            <p className="text-xs text-brand-muted mt-0.5">
              {formatarData(par.movimentacao.data)} ·{' '}
              {formatarCentavos(par.movimentacao.valor_centavos)}
            </p>
          </div>
        </>
      )}

      {par.status === 'sugerido' && (
        <div className="flex gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => onConfirmar(par)}
            className="p-2 rounded-lg bg-brand-green/20 text-brand-green hover:bg-brand-green/30 transition"
            aria-label="Confirmar"
          >
            <Check size={18} />
          </button>
          <button
            type="button"
            onClick={() => onRejeitar(par)}
            className="p-2 rounded-lg bg-brand-red/20 text-brand-red hover:bg-brand-red/30 transition"
            aria-label="Rejeitar"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}