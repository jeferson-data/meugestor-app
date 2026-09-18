import { formatarMoeda } from './formatters';

/**
 * Analisa os dados da empresa e devolve um parecer.
 * Retorna: { nivel, resumo, alertas[], recomendacoes[] }
 *   nivel: 'otimo' | 'bom' | 'atencao' | 'critico'
 */
export function analisarSaudeFinanceira(movimentacoes, movimentacoesMesAnterior = []) {
  // ------------------------------------------------------------
  // 1. Calcular totais do período atual
  // ------------------------------------------------------------
  const soma = (arr) => arr.reduce((s, m) => s + m.valor_centavos, 0);

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

  const receita = soma(receitasPagas);
  const despesa = soma(despesasPagas);
  const resultado = receita - despesa;
  const margem = receita > 0 ? (resultado / receita) * 100 : 0;
  const aReceber = soma(receitasPendentes);
  const aPagar = soma(despesasPendentes);
  const saldoProjetado = resultado + aReceber - aPagar;

  // ------------------------------------------------------------
  // 2. Comparar com o mês anterior
  // ------------------------------------------------------------
  const receitaAnt = soma(
    movimentacoesMesAnterior.filter((m) => m.tipo === 'receita' && m.status === 'pago')
  );
  const despesaAnt = soma(
    movimentacoesMesAnterior.filter((m) => m.tipo === 'despesa' && m.status === 'pago')
  );

  const varReceita = receitaAnt > 0 ? ((receita - receitaAnt) / receitaAnt) * 100 : null;
  const varDespesa = despesaAnt > 0 ? ((despesa - despesaAnt) / despesaAnt) * 100 : null;

  // ------------------------------------------------------------
  // 3. Identificar categoria com maior gasto
  // ------------------------------------------------------------
  const gruposDespesa = {};
  despesasPagas.forEach((m) => {
    const cat = m.categoria || 'Sem categoria';
    gruposDespesa[cat] = (gruposDespesa[cat] || 0) + m.valor_centavos;
  });
  const topDespesa = Object.entries(gruposDespesa).sort((a, b) => b[1] - a[1])[0];

  // ------------------------------------------------------------
  // 4. Determinar nível geral
  // ------------------------------------------------------------
  let nivel = 'bom';
  if (receita === 0 && despesa === 0) nivel = 'sem-dados';
  else if (resultado < 0) nivel = 'critico';
  else if (margem < 10) nivel = 'atencao';
  else if (margem >= 20) nivel = 'otimo';

  // ------------------------------------------------------------
  // 5. Gerar alertas
  // ------------------------------------------------------------
  const alertas = [];

  if (resultado < 0) {
    alertas.push({
      tipo: 'critico',
      texto: `A empresa está a operar no prejuízo. As despesas (${formatarMoeda(despesa)}) ultrapassaram as receitas (${formatarMoeda(receita)}).`,
    });
  }

  if (margem > 0 && margem < 10) {
    alertas.push({
      tipo: 'atencao',
      texto: `A margem de lucro está em ${margem.toFixed(1)}%, abaixo do recomendado (15%). Há pouco espaço para imprevistos.`,
    });
  }

  if (varDespesa !== null && varReceita !== null && varDespesa > varReceita + 5) {
    alertas.push({
      tipo: 'atencao',
      texto: `As despesas cresceram ${varDespesa.toFixed(0)}% enquanto as receitas cresceram apenas ${varReceita.toFixed(0)}%. A margem está a ser comprimida.`,
    });
  }

  if (saldoProjetado < 0) {
    alertas.push({
      tipo: 'critico',
      texto: `Com os valores pendentes, o saldo projetado é negativo (${formatarMoeda(saldoProjetado)}). Existe risco de falta de caixa.`,
    });
  }

  if (topDespesa && despesa > 0 && topDespesa[1] / despesa > 0.4) {
    alertas.push({
      tipo: 'atencao',
      texto: `A categoria "${topDespesa[0]}" representa ${((topDespesa[1] / despesa) * 100).toFixed(0)}% das despesas. Há concentração excessiva.`,
    });
  }

  // ------------------------------------------------------------
  // 6. Gerar recomendações
  // ------------------------------------------------------------
  const recomendacoes = [];

  if (resultado < 0) {
    recomendacoes.push('Reveja as despesas fixas e corte o que não é essencial.');
    recomendacoes.push('Considere aumentar os preços dos produtos/serviços mais vendidos.');
  } else if (margem < 10) {
    recomendacoes.push('Analise se há despesas que podem ser renegociadas.');
    recomendacoes.push('Foque em aumentar o ticket médio das vendas.');
  } else {
    recomendacoes.push('A empresa está saudável. Continue a monitorizar as despesas.');
  }

  if (topDespesa) {
    recomendacoes.push(`Negocie com os fornecedores da categoria "${topDespesa[0]}".`);
  }

  if (aReceber > 0) {
    recomendacoes.push(`Cobre os ${formatarMoeda(aReceber)} em contas a receber.`);
  }

  if (aPagar > resultado && resultado > 0) {
    recomendacoes.push('O saldo pode ficar curto para cobrir as contas a pagar. Planeie com antecedência.');
  }

  // ------------------------------------------------------------
  // 7. Resumo textual
  // ------------------------------------------------------------
  let resumo = '';
  if (nivel === 'sem-dados') {
    resumo = 'Ainda não existem dados suficientes para uma análise. Comece a registar as movimentações.';
  } else if (nivel === 'critico') {
    resumo = `A empresa está a operar no prejuízo. As despesas ultrapassaram as receitas em ${formatarMoeda(Math.abs(resultado))}. Ação urgente necessária.`;
  } else if (nivel === 'atencao') {
    resumo = `A empresa está a dar lucro (${formatarMoeda(resultado)}), mas a margem (${margem.toFixed(1)}%) está abaixo do ideal. Há espaço para melhorar.`;
  } else if (nivel === 'otimo') {
    resumo = `Excelente! A empresa está saudável, com margem de ${margem.toFixed(1)}% e lucro de ${formatarMoeda(resultado)}.`;
  } else {
    resumo = `A empresa está a dar lucro de ${formatarMoeda(resultado)} com uma margem de ${margem.toFixed(1)}%. Situação estável.`;
  }

  return {
    nivel,
    resumo,
    alertas,
    recomendacoes,
    metricas: { receita, despesa, resultado, margem, aReceber, aPagar, saldoProjetado, varReceita, varDespesa },
  };
}