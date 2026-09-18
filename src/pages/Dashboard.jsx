import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';
import { KpiCard } from '../components/ui/Card';
import { formatarMoeda } from '../utils/formatters';
import { agregarPorDia, agregarPorMes, topCategorias } from '../utils/agregacoes';
import { analisarSaudeFinanceira } from '../utils/analise';
import { PainelAnalise } from '../components/PainelAnalise';
import {
  GraficoEvolucaoDiaria,
  GraficoEvolucaoMensal,
  GraficoTopCategorias,
} from '../components/charts/Charts';

export function Dashboard() {
  const { movimentacoes, empresaAtiva, empresas, trocarEmpresa, perfil } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  const [periodoDiario, setPeriodoDiario] = useState(30);
  const [movimentacoesAnterior, setMovimentacoesAnterior] = useState([]);

  // Carregar movimentações do mês anterior (para comparativos)
  useEffect(() => {
    if (!empresaAtiva) {
      setMovimentacoesAnterior([]);
      return;
    }

    const carregar = async () => {
      const agora = new Date();
      const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
      const inicioMes = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}-01`;
      const ultimoDia = new Date(agora.getFullYear(), agora.getMonth(), 0);
      const fimMes = `${ultimoDia.getFullYear()}-${String(ultimoDia.getMonth() + 1).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;

      const { data } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .gte('data', inicioMes)
        .lte('data', fimMes);

      setMovimentacoesAnterior(data || []);
    };

    carregar();
  }, [empresaAtiva]);

  // Filtrar movimentações do mês atual (para análise)
  const movimentacoesMesAtual = useMemo(() => {
    const agora = new Date();
    const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
    return movimentacoes.filter((m) => m.data.startsWith(mesAtual));
  }, [movimentacoes]);

  // KPIs
  const kpis = useMemo(() => {
    const receitasPagas = movimentacoes.filter(
      (m) => m.tipo === 'receita' && m.status === 'pago'
    );
    const despesasPagas = movimentacoes.filter(
      (m) => m.tipo === 'despesa' && m.status === 'pago'
    );
    const receitasPendentes = movimentacoes.filter(
      (m) => m.tipo === 'receita' && m.status === 'pendente'
    );
    const despesasPendentes = movimentacoes.filter(
      (m) => m.tipo === 'despesa' && m.status === 'pendente'
    );

    const soma = (arr) => arr.reduce((s, m) => s + m.valor_centavos, 0);

    const receitaTotal = soma(receitasPagas);
    const despesaTotal = soma(despesasPagas);
    const resultado = receitaTotal - despesaTotal;
    const margem = receitaTotal > 0 ? (resultado / receitaTotal) * 100 : 0;
    const contasReceber = soma(receitasPendentes);
    const contasPagar = soma(despesasPendentes);
    const saldo = resultado;

    return { receitaTotal, despesaTotal, resultado, margem, contasReceber, contasPagar, saldo };
  }, [movimentacoes]);

  // Análise
  const analise = useMemo(
    () => analisarSaudeFinanceira(movimentacoesMesAtual, movimentacoesAnterior),
    [movimentacoesMesAtual, movimentacoesAnterior]
  );

  // Dados dos gráficos
  const diario = useMemo(() => agregarPorDia(movimentacoes, periodoDiario), [movimentacoes, periodoDiario]);
  const mensal = useMemo(() => agregarPorMes(movimentacoes, 6), [movimentacoes]);
  const topDespesas = useMemo(() => topCategorias(movimentacoes, 'despesa', 10), [movimentacoes]);
  const topReceitas = useMemo(() => topCategorias(movimentacoes, 'receita', 10), [movimentacoes]);

  return (
    <div>
      {/* Cabeçalho com seletor de empresa */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-brand-muted">
            {empresaAtiva ? `Resumo de ${empresaAtiva.nome}` : 'Nenhuma empresa ativa'}
          </p>
        </div>

        {isAdmin && empresas.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-brand-muted text-sm">Ver empresa:</label>
            <select
              value={empresaAtiva?.id || ''}
              onChange={(e) => {
                const emp = empresas.find((x) => x.id === e.target.value);
                if (emp) trocarEmpresa(emp);
              }}
              className="px-4 py-2 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green font-semibold"
            >
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Painel de análise */}
      <PainelAnalise analise={analise} />

      {/* KPIs linha 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard label="Receita Total" value={formatarMoeda(kpis.receitaTotal)} help="Somente pagas" color="green" />
        <KpiCard label="Despesas Totais" value={formatarMoeda(kpis.despesaTotal)} help="Somente pagas" color="red" />
        <KpiCard label="Resultado" value={formatarMoeda(kpis.resultado)} highlight />
        <KpiCard label="Margem" value={`${kpis.margem.toFixed(1)}%`} color="green" />
      </div>

      {/* KPIs linha 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Contas a Receber" value={formatarMoeda(kpis.contasReceber)} help="Pendentes de entrada" color="blue" />
        <KpiCard label="Contas a Pagar" value={formatarMoeda(kpis.contasPagar)} help="Pendentes de saída" color="red" />
        <KpiCard label="Saldo Acumulado" value={formatarMoeda(kpis.saldo)} help="Receitas pagas - despesas pagas" color="blue" />
      </div>

      {/* Evolução diária */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Evolução diária</h2>
          <select
            value={periodoDiario}
            onChange={(e) => setPeriodoDiario(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#1A2A44] border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-green"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
        <GraficoEvolucaoDiaria dados={diario} />
      </div>

      {/* Evolução mensal */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-5 mb-6">
        <h2 className="font-bold mb-4">Evolução mensal (últimos 6 meses)</h2>
        <GraficoEvolucaoMensal dados={mensal} />
      </div>

      {/* Top categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Top 10 Despesas</h2>
          <GraficoTopCategorias dados={topDespesas} cor="#FF6B6B" />
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Top 10 Receitas</h2>
          <GraficoTopCategorias dados={topReceitas} cor="#00DFA2" />
        </div>
      </div>
    </div>
  );
}