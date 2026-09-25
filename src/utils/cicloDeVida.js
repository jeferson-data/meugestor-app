// src/utils/cicloDeVida.js
//
// Funções auxiliares do ciclo de vida de uma empresa:
// arquivamento, expurgo e anonimização de dados pessoais.

// Prazo de retenção fiscal (em dias) — 5 anos
export const DIAS_RETENCAO_FISCAL = 365 * 5;

/**
 * Calcula a data de expurgo (5 anos a partir de hoje).
 * Retorna string ISO.
 */
export function calcularExpurgo() {
  const expurgo = new Date();
  expurgo.setDate(expurgo.getDate() + DIAS_RETENCAO_FISCAL);
  return expurgo.toISOString();
}

/**
 * Gera um e-mail anônimo determinístico a partir do UUID do usuário.
 * Garante unicidade sem precisar consultar o banco.
 */
export function emailAnonimo(id) {
  const curto = String(id).replace(/-/g, '').slice(0, 12);
  return `anon-${curto}@excluido.local`;
}

/**
 * Nome genérico usado ao anonimizar.
 */
export const NOME_ANONIMO = '[titular excluído]';

/**
 * Retorna o rótulo amigável de um status de empresa.
 */
export function rotuloStatus(status) {
  const mapa = {
    ativo: 'Ativa',
    ativa: 'Ativa',
    suspenso: 'Inativa',
    suspensa: 'Inativa',
    arquivada: 'Arquivada',
  };
  return mapa[status] || status || '—';
}

/**
 * Calcula quantos dias faltam para o expurgo de uma empresa arquivada.
 * Retorna null se a empresa não está arquivada.
 */
export function diasParaExpurgo(empresa) {
  if (!empresa?.expurgo_em) return null;
  if (empresa.status_acesso !== 'arquivada') return null;
  const agora = new Date();
  const expurgo = new Date(empresa.expurgo_em);
  const dias = Math.ceil((expurgo - agora) / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}