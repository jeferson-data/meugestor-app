// src/utils/conciliacao.js

/**
 * Utilitários de parsing e match para conciliação bancária.
 * Nenhuma dependência de React — funções puras, fáceis de testar.
 */

// ---------------------------------------------------------------
// Helpers de data e valor
// ---------------------------------------------------------------

function toISODate(input) {
  if (!input) return null;
  // Já é YYYY-MM-DD
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    return input.slice(0, 10);
  }
  // Date nativo
  if (input instanceof Date && !isNaN(input)) {
    return input.toISOString().slice(0, 10);
  }
  // dd/mm/yyyy ou dd-mm-yyyy
  if (typeof input === 'string') {
    const m = input.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const [, d, mo, y] = m;
      const ano = y.length === 2 ? `20${y}` : y;
      return `${ano}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return null;
}

function diffDias(a, b) {
  if (!a || !b) return Infinity;
  const d1 = new Date(a + 'T00:00:00');
  const d2 = new Date(b + 'T00:00:00');
  return Math.abs((d1 - d2) / 86400000);
}

/**
 * Converte valor em reais (string ou número) para centavos.
 * Aceita: "1.234,56", "1234.56", "R$ 1.234,56", -50, 50.00
 */
export function paraCentavosArquivo(valor) {
  if (valor == null || valor === '') return null;
  if (typeof valor === 'number') {
    return Math.round(valor * 100);
  }
  let s = String(valor).trim();
  // Remove R$, espaços e símbolos
  s = s.replace(/[R$\s]/g, '');
  // Negativo entre parênteses: (50,00)
  const parentesesNegativo = /^\(.*\)$/.test(s);
  s = s.replace(/[()]/g, '');
  // Se tem vírgula E ponto: o último é separador decimal
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // 1.234,56 → remove pontos, troca vírgula por ponto
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56 → remove vírgulas
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // 1234,56 → troca vírgula por ponto
    s = s.replace(',', '.');
  }
  const n = Number(s);
  if (isNaN(n)) return null;
  const centavos = Math.round(n * 100);
  return parentesesNegativo ? -centavos : centavos;
}

// ---------------------------------------------------------------
// Parsing do arquivo (CSV/XLSX via SheetJS)
// ---------------------------------------------------------------

/**
 * Lê um File (CSV ou XLSX) e retorna { headers, rows }.
 * rows é um array de objetos { [header]: valor }.
 */
export async function lerArquivo(file) {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

/**
 * Aplica o mapeamento de colunas e devolve itens normalizados.
 * mapeamento = { data: 'Data', descricao: 'Histórico', valor: 'Valor' }
 */
export function normalizarItens(rows, mapeamento, tipo) {
  const itens = [];
  for (const row of rows) {
    const dataISO = toISODate(row[mapeamento.data]);
    const descricao = String(row[mapeamento.descricao] || '').trim();
    const valorCentavos = paraCentavosArquivo(row[mapeamento.valor]);

    if (!dataISO || valorCentavos == null || !descricao) continue;

    // No sistema, receita é positiva e despesa é positiva (valor_centavos > 0)
    // O arquivo do banco pode vir com sinal negativo para débito.
    // Normalizamos para sempre positivo e usamos `tipo` para direção.
    const absoluto = Math.abs(valorCentavos);
    itens.push({
      id: `arq-${itens.length}-${dataISO}-${absoluto}`,
      data: dataISO,
      descricao,
      valor_centavos: absoluto,
      tipo, // 'receita' | 'despesa'
      _raw: row,
    });
  }
  return itens;
}

// ---------------------------------------------------------------
// Lógica de match (nível B: sugere, humano confirma)
// ---------------------------------------------------------------

/**
 * Concilia itens do arquivo com movimentações do sistema.
 *
 * Regras:
 * - valor exato (em centavos)
 * - mesma direção (receita ↔ receita, despesa ↔ despesa)
 * - data dentro da tolerância (±N dias)
 * - se houver mais de um candidato com mesmo valor+data, marca como ambíguo
 *
 * Retorna { pares, orfaos, ambiguos }
 */
export function conciliar(
  itensArquivo,
  movimentacoes,
  { toleranciaDias = 1 } = {}
) {
  const usados = new Set();
  const pares = [];
  const ambiguos = [];

  for (const item of itensArquivo) {
    const candidatos = movimentacoes.filter(
      (m) =>
        !usados.has(m.id) &&
        m.tipo === item.tipo &&
        Math.abs(m.valor_centavos) === item.valor_centavos &&
        diffDias(m.data, item.data) <= toleranciaDias
    );

    if (candidatos.length === 1) {
      usados.add(candidatos[0].id);
      pares.push({
        item,
        movimentacao: candidatos[0],
        status: 'sugerido',
      });
    } else if (candidatos.length > 1) {
      ambiguos.push({ item, candidatos });
    } else {
      pares.push({ item, movimentacao: null, status: 'sem_par' });
    }
  }

  const orfaos = movimentacoes.filter((m) => !usados.has(m.id));

  return { pares, orfaos, ambiguos };
}

// ---------------------------------------------------------------
// Formatação auxiliar para a UI
// ---------------------------------------------------------------

export function formatarCentavos(centavos) {
  return (Math.abs(centavos) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}