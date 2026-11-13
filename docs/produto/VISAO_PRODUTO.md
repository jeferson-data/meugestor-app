# Visão inicial do produto — Meu Gestor para lojas mistas

- **Produto:** Meu Gestor
- **Público prioritário:** pequenas lojas mistas de bairro, que comercializam diferentes tipos de produtos
- **Repositório:** `jeferson-data/meugestor-app`
- **Branch:** `docs/engenharia-software-scrum`
- **Decisão de segmento:** lojas mistas (opção D), confirmada pelo responsável pelo produto
- **Status:** hipótese de produto para validação com comerciantes

## 1. Visão do produto

Ajudar proprietários de pequenas lojas mistas a entender e controlar a movimentação financeira do negócio, organizar entradas e saídas, acompanhar contas e tomar decisões com informações simples, sem depender de planilhas complexas.

O Meu Gestor deve ser percebido como uma ferramenta prática de gestão para o dia a dia do comerciante, e não como um sistema contábil ou ERP complexo.

## 2. Segmento prioritário

O público inicial será formado por **lojas mistas de bairro**, que vendem produtos de diferentes categorias no mesmo estabelecimento. O sistema não deve ser desenhado para uma única especialidade comercial.

A variedade do mix de produtos torna importante validar como cada loja organiza suas categorias, compras, vendas e estoque. Não presumir que todas as lojas tenham o mesmo sortimento, volume, equipe ou processo operacional.

## 3. Problemas a validar com potenciais clientes

As questões abaixo são hipóteses de descoberta, não necessidades já comprovadas:

1. O proprietário não sabe com clareza quanto vendeu, recebeu e gastou no dia ou no mês.
2. Mistura dinheiro pessoal com dinheiro da loja.
3. Não acompanha contas a pagar e a receber de forma organizada.
4. Não sabe quais categorias de produtos ou despesas mais impactam o resultado.
5. Compra mercadorias sem uma visão clara do capital disponível.
6. Tem dificuldade para conferir vendas, recebimentos e movimentações bancárias.
7. Utiliza caderno, planilhas, mensagens ou memória para administrar o negócio.
8. Tem pouco tempo e pouca familiaridade com sistemas complexos.
9. Tem dificuldade para organizar produtos de naturezas diferentes sem um cadastro excessivamente trabalhoso.

## 4. Proposta inicial de valor

"Tenha uma visão simples do dinheiro que entra, sai e fica na sua loja, para administrar o negócio com mais controle e menos improviso."

A proposta deverá ser validada em conversas e testes de uso. Não prometer aumento de lucro, automação integral ou conformidade contábil.

## 5. Escopo candidato para o primeiro produto comercial

O escopo abaixo é uma proposta para priorização. A existência de uma tela ou rotina no código não significa que o requisito esteja concluído, testado ou pronto para uso comercial.

### Essencial para avaliar no piloto

- Cadastro e acesso seguro do estabelecimento;
- Registro simples de entradas e saídas;
- Categorias configuráveis de receitas e despesas;
- Contas a pagar e a receber, com status e vencimentos;
- Visão diária e mensal de receitas, despesas e resultado;
- Consulta e filtro de movimentações;
- Exportação ou relatório básico para conferência;
- Experiência utilizável em celular e computador;
- Separação segura dos dados de cada estabelecimento.

### Importante, sujeito à validação

- Cadastro de produtos com categorias flexíveis;
- Cadastro de fornecedores;
- Registro de compras de mercadorias;
- Controle de estoque e alertas de reposição;
- Registro de vendas por forma de pagamento;
- Relatórios por categoria e período;
- Conciliação de recebimentos e extratos;
- Gestão de usuários e permissões.

### Não assumir como parte do primeiro piloto

- Emissão fiscal ou substituição de sistema fiscal;
- Contabilidade ou apuração tributária;
- Integração com todas as maquininhas e bancos;
- ERP completo;
- Previsão automática de demanda;
- Inteligência artificial para decisões financeiras.

Esses itens só devem entrar no escopo quando houver necessidade real, viabilidade técnica e validação jurídica/fiscal quando aplicável.

## 6. Princípios de experiência do usuário

1. **Linguagem cotidiana:** usar termos que o comerciante entende.
2. **Poucos passos:** registrar uma movimentação deve ser rápido.
3. **Flexibilidade:** permitir organizar categorias sem exigir um cadastro complexo de todo o sortimento logo no início.
4. **Mobile first:** as tarefas frequentes precisam funcionar bem no celular.
5. **Indicadores claros:** diferenciar venda, recebimento, despesa, lucro estimado e saldo de caixa.
6. **Transparência:** permitir entender de onde vem cada número.
7. **Recuperação de erros:** evitar perda de lançamentos e oferecer confirmação para ações destrutivas.
8. **Confiabilidade:** consistência dos dados tem prioridade sobre quantidade de funcionalidades.

## 7. Critérios de sucesso do piloto

As metas numéricas serão definidas após conhecer o primeiro estabelecimento. Inicialmente, observar:

- O comerciante consegue configurar a loja sem ajuda constante?
- Consegue registrar uma entrada e uma saída sem orientação?
- Consegue categorizar movimentações de tipos diferentes de mercadoria?
- Entende os indicadores do painel?
- Os números apresentados conferem com os registros reais?
- O aplicativo economiza tempo ou reduz alguma tarefa manual?
- O comerciante utiliza o produto em dias consecutivos?
- Identifica valor suficiente para considerar pagar pelo serviço?
- Quais funções ele realmente usa e quais ignora?

## 8. Plano de descoberta com a primeira loja

1. Entrevistar o proprietário sobre como controla caixa, vendas, despesas, compras e estoque atualmente.
2. Observar uma rotina real de fechamento de caixa, se o comerciante permitir.
3. Identificar como organiza as diferentes categorias de produtos e fornecedores.
4. Identificar os três problemas mais frequentes e custosos.
5. Demonstrar somente os fluxos relacionados a esses problemas.
6. Acompanhar um piloto com dados reais, com autorização e cuidados de privacidade.
7. Registrar dúvidas, erros, tarefas abandonadas e pedidos de melhoria.
8. Ao final, decidir o que corrigir antes de oferecer um plano pago.

## 9. Decisões pendentes

- Validar com comerciantes o perfil de loja mista e os principais tipos de mercadoria vendidos.
- Confirmar se o controle de estoque é requisito indispensável para os primeiros clientes.
- Definir como o comerciante registra as vendas: manualmente, por PDV, maquininha, marketplace ou combinação.
- Confirmar se o produto será apenas financeiro no primeiro momento ou se deverá incluir vendas e estoque.
- Definir o nível de detalhe necessário no cadastro de produtos e categorias.
- Definir preço e modelo de cobrança somente após validar o valor percebido e os custos de operação.

## 10. Relação com o diagnóstico técnico

O inventário técnico deve verificar, com evidências do repositório, quais itens candidatos já existem e qual o estado de cada um. Cada capacidade deverá receber uma classificação:

- **Implementada e verificada:** código e testes/evidências confirmam o comportamento;
- **Implementada, não verificada:** há código, mas faltam testes ou validação de ponta a ponta;
- **Parcial:** existe apenas parte do fluxo;
- **Ausente:** não foi encontrada implementação;
- **A decidir:** depende de validação com o público.

Não classificar uma funcionalidade como pronta para comercialização apenas porque existe uma página ou chamada de banco de dados.
