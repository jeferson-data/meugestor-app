import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { paraCentavos } from '../utils/formatters';

export function Lancamentos() {
  const { adicionarMovimentacao, empresaAtiva } = useApp();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState('receita');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('pendente');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!empresaAtiva) return setErro('Nenhuma empresa ativa.');
    if (!descricao.trim()) return setErro('Informe a descrição.');
    if (!valor || Number(valor) <= 0) return setErro('Informe um valor válido.');

    setLoading(true);
    const result = await adicionarMovimentacao({
      tipo,
      categoria,
      descricao,
      valor_centavos: paraCentavos(valor),
      data,
      status,
    });
    setLoading(false);

    if (result.success) navigate('/extrato');
    else setErro(result.error);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Novo lançamento</h1>
      <p className="text-brand-muted mb-6">Registe uma entrada ou saída.</p>

      {erro && (
        <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipo('receita')}
            className={`py-4 rounded-xl border-2 font-bold transition ${
              tipo === 'receita'
                ? 'border-brand-green bg-brand-green/10 text-brand-green'
                : 'border-brand-border text-brand-muted'
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo('despesa')}
            className={`py-4 rounded-xl border-2 font-bold transition ${
              tipo === 'despesa'
                ? 'border-brand-red bg-brand-red/10 text-brand-red'
                : 'border-brand-border text-brand-muted'
            }`}
          >
            Saída
          </button>
        </div>

        <Input
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ex: Venda de produtos"
        />

        <Input
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Venda para Maria"
          required
        />

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          required
        />

        <Input
          label="Data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <div>
          <label className="block text-sm font-semibold text-brand-muted mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'A guardar...' : 'Salvar lançamento'}
        </Button>
      </form>
    </div>
  );
}