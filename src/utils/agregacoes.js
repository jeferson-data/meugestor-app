// src/utils/agregacoes.js
import { formatarData } from './formatters';

/**
 * Agrupa movimentações por dia.
 * Devolve array: [{ dia, entradas, saidas, saldoDia, saldo, label }]
 *
 * - saldoDia = entradas do dia - saídas do dia
 * - saldo    = acumulado até o dia (soma corrida)
 * - label    = "18/09" para exibir no eixo X
 */
export function agregarPorDia(movimentacoes, dias = 30) {
  const mapa = {};

  for (let i = 0; i <= dias; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (dias - i));
    const key = d.toISOString().slice(0, 10);
    mapa[key] = { dia: key, entradas: 0, saidas: 0, saldoDia: 0, saldo: 0 };
  }

  movimentacoes.forEach((m) => {
    const key = m.data;
    if (!mapa[key]) return;
    if (m.tipo === 'receita') mapa[key].entradas += m.valor_centavos;
    else if (m.tipo === 'despesa') mapa[key].saidas += m.valor_centavos;
  });

  const lista = Object.values(mapa).sort((a, b) => a.dia.localeCompare(b.dia));

  let acumulado = 0;
  lista.forEach((item) => {
    item.saldoDia = item.entradas - item.saidas;
    acumulado += item.saldoDia;
    item.saldo = acumulado;
    item.label = formatarData(item.dia).slice(0, 5); // "18/09"
  });

  return lista;
}

/**
 * Agrupa movimentações por mês (últimos N meses).
 * Devolve array: [{ mes, entradas, saidas, saldoDia, saldo, label }]
 */
export function agregarPorMes(movimentacoes, meses = 6) {
  const agora = new Date();
  const mapa = {};

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    mapa[key] = {
      mes: key,
      entradas: 0,
      saidas: 0,
      saldoDia: 0,
      saldo: 0,
      label: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
    };
  }

  movimentacoes.forEach((m) => {
    const key = m.data.slice(0, 7);
    if (!mapa[key]) return;
    if (m.tipo === 'receita') mapa[key].entradas += m.valor_centavos;
    else if (m.tipo === 'despesa') mapa[key].saidas += m.valor_centavos;
  });

  const lista = Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));

  let acumulado = 0;
  lista.forEach((item) => {
    item.saldoDia = item.entradas - item.saidas;
    acumulado += item.saldoDia;
    item.saldo = acumulado;
  });

  return lista;
}

/**
 * Devolve top N categorias por tipo.
 * [{ categoria, valor }]
 */
export function topCategorias(movimentacoes, tipo, limite = 10) {
  const mapa = {};

  movimentacoes
    .filter((m) => m.tipo === tipo)
    .forEach((m) => {
      const cat = m.categoria || 'Sem categoria';
      if (!mapa[cat]) mapa[cat] = 0;
      mapa[cat] += m.valor_centavos;
    });

  return Object.entries(mapa)
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, limite);
}