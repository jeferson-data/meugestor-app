// src/utils/agregacoes.js
import { formatarData } from './formatters';

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

// ... resto do arquivo (agregarPorMes, topCategorias) inalterado