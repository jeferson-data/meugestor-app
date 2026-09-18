import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatarMoeda, formatarData } from '../utils/formatters';

export function Extrato() {
  const { movimentacoes, removerMovimentacao } = useApp();
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const lista = useMemo(() => {
    return movimentacoes.filter((m) => {
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false;
      if (busca && !`${m.descricao} ${m.categoria}`.toLowerCase().includes(busca.toLowerCase()))
        return false;
      return true;
    });
  }, [movimentacoes, busca, filtroTipo]);

  const handleRemover = async (id) => {
    if (!confirm('Remover este lançamento?')) return;
    await removerMovimentacao(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Extrato</h1>
      <p className="text-brand-muted mb-6">Todas as movimentações registadas.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
        >
          <option value="todos">Todos</option>
          <option value="receita">Entradas</option>
          <option value="despesa">Saídas</option>
        </select>
      </div>

      {lista.length === 0 && (
        <div className="text-center text-brand-muted py-10">Nenhum lançamento encontrado.</div>
      )}

      <div className="flex flex-col gap-2">
        {lista.map((m) => {
          const isReceita = m.tipo === 'receita';
          return (
            <div
              key={m.id}
              className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{m.descricao}</div>
                <div className="text-brand-muted text-xs mt-1">
                  {formatarData(m.data)} · {m.categoria || 'Sem categoria'}
                </div>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      isReceita
                        ? 'bg-brand-green/15 text-brand-green'
                        : 'bg-brand-red/15 text-brand-red'
                    }`}
                  >
                    {isReceita ? 'Entrada' : 'Saída'}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      m.status === 'pago'
                        ? 'bg-brand-green/15 text-brand-green'
                        : 'bg-brand-red/15 text-brand-red'
                    }`}
                  >
                    {m.status === 'pago' ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${isReceita ? 'text-brand-green' : 'text-brand-red'}`}>
                  {isReceita ? '+' : '-'} {formatarMoeda(m.valor_centavos)}
                </div>
                <button
                  onClick={() => handleRemover(m.id)}
                  className="text-brand-subtle hover:text-brand-red text-sm mt-1"
                >
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}