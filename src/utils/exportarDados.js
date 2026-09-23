// src/utils/exportarDados.js
//
// Gera a exportação de dados do titular, conforme LGPD art. 18, II e V
// (direito de acesso e portabilidade).
//
// Formato: CSV único com blocos separados por cabeçalho, sem dependências
// externas. Abre no Excel, Google Sheets e qualquer editor de texto.

// ---------------------------------------------------------------
// Helpers de CSV
// ---------------------------------------------------------------

/**
 * Escapa um valor para CSV. Se contiver vírgula, aspas ou quebra de
 * linha, envolve em aspas duplas e duplica aspas internas.
 */
function escapar(valor) {
  if (valor == null) return '';
  const s = String(valor).replace(/"/g, '""');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s}"`;
  }
  return s;
}

/**
 * Monta uma linha CSV a partir de um array de campos.
 */
function linhaCSV(campos) {
  return campos.map(escapar).join(',');
}

/**
 * Converte centavos (número inteiro) para string em reais no padrão
 * brasileiro. Ex.: 1234 → "12,34".
 */
function centavosParaReal(centavos) {
  const n = Number(centavos);
  if (isNaN(n)) return '0,00';
  return (n / 100).toFixed(2).replace('.', ',');
}

/**
 * Formata data/hora ISO para o padrão brasileiro.
 */
function formatarDataHora(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return String(iso);
  }
}

// ---------------------------------------------------------------
// Blocos de exportação
// ---------------------------------------------------------------

function blocoDadosPessoais(perfil) {
  const linhas = [
    '=== 1. DADOS PESSOAIS ===',
    linhaCSV(['Nome', 'Email', 'Função', 'Empresa vinculada']),
  ];

  if (perfil) {
    linhas.push(
      linhaCSV([
        perfil.nome || '',
        perfil.email || '',
        perfil.role || '',
        perfil.empresa_nome || '',
      ])
    );
  } else {
    linhas.push(linhaCSV(['(sem dados)']));
  }

  return linhas.join('\n');
}

function blocoEmpresa(empresa) {
  const linhas = [
    '=== 2. DADOS DA EMPRESA ===',
    linhaCSV([
      'Nome',
      'Nome fantasia',
      'CNPJ',
      'Telefone',
      'Email',
      'Endereço',
      'Status',
    ]),
  ];

  if (empresa) {
    linhas.push(
      linhaCSV([
        empresa.nome || '',
        empresa.nome_fantasia || '',
        empresa.cnpj || '',
        empresa.telefone || '',
        empresa.email || '',
        empresa.endereco || '',
        empresa.status_acesso || '',
      ])
    );
  } else {
    linhas.push(linhaCSV(['(sem dados)']));
  }

  return linhas.join('\n');
}

function blocoMovimentacoes(movimentacoes) {
  const linhas = [
    '=== 3. MOVIMENTAÇÕES ===',
    linhaCSV([
      'Data',
      'Tipo',
      'Categoria',
      'Descrição',
      'Valor (R$)',
      'Status',
      'Lançado por',
    ]),
  ];

  if (movimentacoes?.length) {
    movimentacoes.forEach((m) => {
      linhas.push(
        linhaCSV([
          m.data || '',
          m.tipo === 'receita' ? 'Entrada' : 'Saída',
          m.categoria || '',
          m.descricao || '',
          centavosParaReal(m.valor_centavos),
          m.status || '',
          m.lancado_por || '',
        ])
      );
    });
  } else {
    linhas.push(linhaCSV(['(sem movimentações)']));
  }

  return linhas.join('\n');
}

function blocoAuditoria(auditLog, nomeUsuario) {
  const linhas = [
    '=== 4. HISTÓRICO DE ATIVIDADES ===',
    linhaCSV(['Data', 'Ação', 'Usuário']),
  ];

  // Só inclui as ações do próprio titular.
  // Para incluir todas as ações da empresa, remova o .filter abaixo.
  const registros = (auditLog || []).filter(
    (a) => !nomeUsuario || a.usuario_nome === nomeUsuario
  );

  if (registros.length) {
    registros.forEach((a) => {
      linhas.push(
        linhaCSV([
          formatarDataHora(a.quando),
          a.acao || '',
          a.usuario_nome || '',
        ])
      );
    });
  } else {
    linhas.push(linhaCSV(['(sem registros)']));
  }

  return linhas.join('\n');
}

// ---------------------------------------------------------------
// Gerador principal
// ---------------------------------------------------------------

/**
 * Gera o conteúdo completo do arquivo de exportação.
 *
 * @param {object} dados
 * @param {object} dados.perfil        - usuário logado (tabela usuarios)
 * @param {object} dados.empresa       - empresa ativa (tabela empresas)
 * @param {array}  dados.movimentacoes - todas as movimentações da empresa
 * @param {array}  dados.auditLog      - registros de auditoria
 * @returns {string} conteúdo completo, pronto para download
 */
export function gerarExportacaoCompleta({
  perfil,
  empresa,
  movimentacoes,
  auditLog,
}) {
  const agora = new Date().toLocaleString('pt-BR');

  const cabecalho = [
    '=== MEUS DADOS — MEUGESTOR ===',
    `Gerado em: ${agora}`,
    `Empresa: ${empresa?.nome || '(sem empresa ativa)'}`,
    `Titular: ${perfil?.nome || '(sem perfil)'}`,
    '',
    'Este arquivo contém todos os dados pessoais e financeiros',
    'que o MeuGestor guarda sobre você, conforme a LGPD (art. 18).',
    '',
    'Observações:',
    '- Descrições de movimentações podem conter nomes de terceiros',
    '  que você mesmo digitou ao registrar a operação.',
    '- Os dados financeiros são retidos por 5 anos após a exclusão',
    '  da conta, por exigência fiscal (CTN art. 173 e 174).',
    '',
  ].join('\n');

  return [
    cabecalho,
    blocoDadosPessoais(perfil),
    '',
    blocoEmpresa(empresa),
    '',
    blocoMovimentacoes(movimentacoes),
    '',
    blocoAuditoria(auditLog, perfil?.nome),
    '',
    '=== FIM ===',
  ].join('\n');
}

// ---------------------------------------------------------------
// Download
// ---------------------------------------------------------------

/**
 * Dispara o download de um arquivo texto no navegador.
 * O BOM (\uFEFF) garante que o Excel reconheça UTF-8 corretamente.
 */
export function baixarArquivo(nome, conteudo, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gera um nome de arquivo amigável, com slug da empresa e data.
 * Ex.: "meus-dados-oficina-silva-2026-09-23.csv"
 */
export function nomeArquivoExportacao(empresaNome) {
  const hoje = new Date().toISOString().slice(0, 10);
  const slug = (empresaNome || 'meugestor')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `meus-dados-${slug}-${hoje}.csv`;
}