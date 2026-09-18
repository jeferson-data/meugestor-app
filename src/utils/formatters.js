export function formatarMoeda(centavos) {
  if (centavos == null) return 'R$ 0,00';
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

export function paraCentavos(valorReais) {
  return Math.round(Number(valorReais) * 100);
}

export function paraReais(centavos) {
  return (Number(centavos) / 100).toFixed(2);
}

export function mesReferenciaAtual() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}-01`;
}