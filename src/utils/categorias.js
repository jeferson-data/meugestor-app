// src/utils/categorias.js

// Os valores 'receita' / 'despesa' são os mesmos já usados em Lancamentos.jsx
// e gravados no banco. Não altere essas chaves sem migrar os dados.
export const CATEGORIAS = {
  receita: [
    'Vendas',
    'Serviços',
    'Maquininha de cartão',
    'Outros ganhos',
  ],
  despesa: [
    'Mercadorias e fornecedores',
    'Contas do negócio',
    'Funcionários',
    'Retirada do dono',
    'Outros gastos',
  ],
}

export const getCategoriasPorTipo = (tipo) =>
  CATEGORIAS[tipo] ?? []

// Para uso nos gráficos: garante que uma categoria desconhecida
// não apareça como fatia vazia.
export const TODAS_CATEGORIAS = [
  ...CATEGORIAS.receita,
  ...CATEGORIAS.despesa,
]

export const normalizarCategoria = (categoria) =>
  TODAS_CATEGORIAS.includes(categoria) ? categoria : 'Outros'