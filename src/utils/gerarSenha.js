// Lista de palavras simples e legíveis
const PALAVRAS = [
  'Padaria', 'Mercado', 'Oficina', 'Loja', 'Escritorio',
  'Transporte', 'Servico', 'Cliente', 'Gestor', 'Forte',
  'Rapido', 'Seguro', 'Novo', 'Bom', 'Top',
];

// Caracteres permitidos (sem O, 0, l, 1 para evitar ambiguidade)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarCodigo(tamanho = 4) {
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return codigo;
}

export function gerarSenhaProvisoria() {
  const palavra = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
  const codigo = gerarCodigo(4);
  return `${palavra}-${codigo}`;
}