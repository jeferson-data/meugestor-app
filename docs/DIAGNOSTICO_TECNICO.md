# Diagnóstico técnico inicial — Meu Gestor

- **Projeto:** Meu Gestor
- **Repositório:** `jeferson-data/meugestor-app`
- **Branch de trabalho:** `docs/engenharia-software-scrum`
- **Data do diagnóstico:** 13/11/2026
- **Status:** diagnóstico preliminar; inventário ainda não concluído

## 1. Objetivo

Registrar o estado conhecido do software antes de revisar sua documentação ou propor alterações funcionais. Este diagnóstico é retrospectivo: descreve evidências encontradas no repositório e separa fatos confirmados de pontos que ainda precisam de inspeção.

O produto tem dois objetivos complementares:

1. **Acadêmico e profissional:** aplicar práticas de Engenharia de Software, com Scrum adaptado ao projeto, documentação rastreável e decisões técnicas justificadas.
2. **Comercial:** evoluir o Meu Gestor para um serviço confiável, utilizável e sustentável para pequenos negócios.

## 2. Evidências consultadas

Foram inspecionados nesta etapa:

- `README.md`
- `package.json`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `.gitignore`
- `.env.example`

Também foi consultado o diff do commit que revisou o README, identificado como `5b7aaf2cb380dc4084cc2f483cb35c7b47087b85`.

**Limite:** este documento não representa uma auditoria completa do código, banco de dados, políticas do Supabase, funções de backend, deploy ou segurança. Esses itens permanecem no backlog de diagnóstico.

## 3. Visão geral confirmada

O README descreve o Meu Gestor como uma aplicação web para controle de fluxo de caixa, movimentações, pagamentos e gestão operacional de pequenos negócios.

O código de roteamento confirma páginas para:

- Login, recuperação e redefinição de senha;
- Contratação;
- Dashboard;
- Lançamentos;
- Extrato;
- Empresas;
- Pagamentos;
- Utilizadores;
- Vendedores;
- Conciliação;
- Perfil da empresa;
- Pedidos;
- Conta suspensa.

As rotas principais são protegidas por autenticação. O componente `RotaProtegida` também verifica o perfil e o estado de acesso da empresa ativa, bloqueando empresas com status suspenso, suspensa ou arquivada, exceto perfis identificados no código como administradores do programa ou donos do programa.

## 4. Tecnologias e configuração confirmadas

### Dependências de produção

| Tecnologia/pacote | Versão declarada | Uso confirmado ou provável |
|---|---:|---|
| React | ^19.2.8 | Construção da interface |
| React DOM | ^19.2.8 | Renderização no navegador |
| @supabase/supabase-js | ^2.116.0 | Cliente de integração com Supabase |
| React Router DOM | ^7.18.4 | Roteamento da aplicação |
| Recharts | ^3.10.1 | Biblioteca de gráficos |
| Lucide React | ^1.47.0 | Ícones |
| vite-plugin-pwa | ^1.3.0 | Integração PWA com Vite |
| xlsx | ^0.18.5 | Leitura/geração de planilhas; confirmar os fluxos efetivamente usados |

### Dependências de desenvolvimento

| Tecnologia/pacote | Versão declarada | Uso |
|---|---:|---|
| Vite | ^8.3.0 | Servidor de desenvolvimento e build |
| @vitejs/plugin-react | ^6.1.1 | Integração React com Vite |
| Tailwind CSS | ^3.4.17 | Estilização |
| PostCSS | ^8.5.28 | Processamento CSS |
| Autoprefixer | ^10.6.1 | Compatibilidade CSS |
| Oxlint | ^1.81.0 | Análise estática/lint |
| @types/react | ^19.2.18 | Tipos React |
| @types/react-dom | ^19.2.7 | Tipos React DOM |

As versões acima são as declaradas no `package.json`; não representam necessariamente a versão exata instalada. A versão resolvida deve ser confirmada no lockfile.

### Scripts disponíveis

| Script | Comando |
|---|---|
| dev | `vite` |
| build | `vite build` |
| lint | `oxlint` |
| preview | `vite preview` |

Não há script de testes automatizados declarado no `package.json` consultado. Isso não prova que não existam testes manuais ou outros mecanismos fora desses scripts.

## 5. Arquitetura observada inicialmente

O ponto de entrada `src/main.jsx` monta a aplicação React e carrega o CSS global.

O arquivo `src/App.jsx` demonstra:

- React como camada de interface;
- React Router DOM para navegação;
- `AuthProvider` como provedor de contexto de autenticação;
- `AppProvider` como provedor de contexto da aplicação;
- Um componente de layout compartilhado;
- Separação de páginas por funcionalidade;
- Componentes de proteção e redirecionamento de rotas.

O arquivo `vite.config.js` configura o plugin React e o `vite-plugin-pwa`. O manifesto PWA declara nome, descrição, cores, modo de exibição standalone, orientação portrait e ícones. A configuração inclui padrões de arquivos para precache e limpeza de caches antigos. A estratégia e o comportamento offline efetivo ainda precisam ser validados.

## 6. Configuração e proteção de variáveis

O `.env.example` contém os nomes:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O `.gitignore` exclui `.env`, `.env.local` e arquivos locais de ambiente. A presença desses itens é uma evidência de configuração prevista; não substitui a revisão das políticas de segurança do Supabase. Variáveis com prefixo `VITE_` são disponibilizadas ao código do cliente e não devem conter segredos privilegiados.

## 7. Problemas documentais identificados no README

1. O bloco `bash` iniciado na seção de verificação das versões não é fechado depois de `npm --version`. Isso faz com que o restante do documento seja interpretado como código.
2. Os comandos de instalação, títulos, árvore de diretórios e funcionalidades não estão estruturados corretamente em Markdown.
3. O contato do LinkedIn contém o texto provisório `seu-linkedin`.
4. O README afirma “rastreabilidade completa” e “conformidade” sem que a cobertura e o propósito do mecanismo de auditoria tenham sido verificados.
5. Expressões como “automatização completa”, “tempo real” e “pronta para o mercado” precisam ser comprovadas ou reformuladas de maneira mais precisa.
6. A tabela de tecnologias não contempla todas as dependências relevantes, como PWA e XLSX.
7. A estrutura de diretórios apresentada é ilustrativa e ainda não foi comparada com a árvore real do repositório.

## 8. Riscos e pontos que exigem validação antes da comercialização

Os itens abaixo são **perguntas de diagnóstico**, não defeitos confirmados:

- Isolamento dos dados entre empresas/contas e validação das políticas RLS no Supabase;
- Autorização efetiva no banco, além das proteções de interface e rotas;
- Regras para lançamentos, estornos, exclusões, conciliação e fechamento de períodos;
- Integridade e consistência dos cálculos financeiros;
- Tratamento de erros, estados de carregamento e indisponibilidade de serviços;
- Backup, restauração, retenção e descarte de dados;
- Auditoria: eventos registrados, ator, data, entidade afetada e proteção contra alteração;
- LGPD: finalidade, minimização, acesso, transparência e ciclo de vida dos dados pessoais;
- Testes automatizados e processo de validação antes de publicar;
- Monitoramento, logs e resposta a incidentes;
- Termos de uso, política de privacidade, suporte e processo de atendimento;
- Cobrança, cancelamento, inadimplência e limites dos planos, caso sejam oferecidos comercialmente.

## 9. Backlog de diagnóstico

| ID | Atividade | Situação |
|---|---|---|
| DIAG-01 | Inspecionar a árvore completa do repositório | Concluído — árvore principal, src, docs e supabase inventariados |
| DIAG-02 | Inventariar e revisar o conteúdo de `docs/` | Pendente |
| DIAG-03 | Mapear páginas, componentes, contextos e serviços | Parcial |
| DIAG-04 | Inspecionar cliente Supabase e chamadas de dados | Pendente |
| DIAG-05 | Inspecionar migrations, schema, funções e políticas RLS | Parcial — documentação do schema e Edge Function revisadas; não há migrations/policies versionadas identificadas; estado do Supabase ativo não verificado |
| DIAG-06 | Mapear regras de negócio por módulo | Pendente |
| DIAG-07 | Verificar testes, lint, build e automações de deploy | Pendente |
| DIAG-08 | Revisar README com base no inventário confirmado | Aguardando DIAG-01 a DIAG-07 |

## 10. Critério de conclusão do diagnóstico

O diagnóstico será considerado concluído quando:

- A árvore do repositório tiver sido inventariada;
- A documentação existente tiver sido lida e classificada;
- Os módulos da aplicação e suas integrações estiverem mapeados;
- A estrutura do banco, funções e políticas relevantes estiverem documentadas;
- Cada funcionalidade descrita tiver evidência ou estiver explicitamente marcada como não verificada;
- As lacunas e riscos estiverem priorizados no Product Backlog.

## 11. Próxima decisão

Não alterar regras de negócio nem refatorar funcionalidades nesta fase. Primeiro concluir o diagnóstico e registrar as decisões. Depois, revisar o README e iniciar a especificação formal do produto e dos requisitos.


## 12. Evidências adicionais — contextos, autenticação e movimentações

Após a primeira versão deste documento, foram inspecionados também:

- `src/contexts/AuthContext.jsx`
- `src/contexts/AppContext.jsx`
- `src/services/supabase.js`
- `src/pages/Dashboard.jsx`
- `src/hooks/usePlano.js`
- `index.html`
- `tailwind.config.js`

### 12.1 Autenticação

O contexto de autenticação utiliza Supabase Auth para:

- Recuperar a sessão existente;
- Escutar alterações de autenticação;
- Entrar com e-mail e senha;
- Criar usuário com metadado de nome;
- Encerrar sessão.

O cliente Supabase configura persistência de sessão, renovação automática do token e detecção de sessão na URL.

**Ponto de validação:** revisar fluxo de confirmação de e-mail, recuperação de senha, redefinição, expiração de sessão e tratamento de falhas. O código do contexto, isoladamente, não comprova a segurança das políticas do banco.

### 12.2 Contexto da aplicação e isolamento por empresa

O `AppContext` carrega perfil na tabela `usuarios`, vínculos na tabela `user_empresas` e empresas na tabela `empresas`. Para perfis `admin_programa` e `dono_programa`, a consulta carrega empresas não arquivadas; para os demais perfis, utiliza os vínculos do usuário.

As consultas de movimentações, auditoria e conciliações filtram pelo identificador da empresa ativa.

**Ponto de validação prioritário:** filtros no frontend não substituem políticas RLS. Precisamos inspecionar políticas e testar com contas distintas se todas as tabelas e operações impedem acesso cruzado.

### 12.3 Movimentações

O contexto valida tipo, categoria e valor positivo antes de inserir ou atualizar movimentações. Os valores são armazenados em centavos (`valor_centavos`). O lançamento inclui empresa, tipo, categoria, descrição, data, status e nome de quem lançou.

O código permite atualizar e excluir movimentações. A exclusão também remove do estado local as conciliações associadas à movimentação.

**Riscos a investigar:** trilha histórica de alterações/exclusões, permissões por papel, integridade referencial, regras para movimentações já conciliadas e prevenção de alteração indevida de períodos fechados.

### 12.4 Auditoria e conciliação

O código registra eventos de lançamento, atualização, exclusão e conciliação por meio da tabela `audit_log`. Entretanto, a função de registro captura falhas e apenas emite aviso no console; a operação de negócio pode ser concluída mesmo se o registro de auditoria falhar.

A conciliação grava dados do item importado e da movimentação associada, com status `conciliado`. A conciliação em lote processa os pares sequencialmente e acumula sucessos e falhas.

**Pontos prioritários:** verificar se a auditoria é obrigatória para operações críticas, se pode ser alterada pelo cliente, se existe trilha imutável no banco e se a conciliação impede duplicidade, divergência de valores ou associação de movimentação pertencente a outra empresa. Verificar também se operações compostas precisam de transação no backend.

### 12.5 Dashboard e semântica dos indicadores

O Dashboard calcula:

- Receita paga e despesa paga a partir das movimentações carregadas;
- Resultado como receita paga menos despesa paga;
- Margem como resultado dividido pela receita paga, quando a receita é positiva;
- Contas a receber e pagar a partir de movimentações pendentes;
- Indicador “Saldo Acumulado” com a mesma fórmula do resultado.

A fórmula observada para “Saldo Acumulado” é resultado líquido das movimentações pagas carregadas, não uma leitura comprovada de saldo bancário. O nome e a abrangência temporal precisam ser revistos para evitar interpretação equivocada pelo usuário.

**Ponto de validação:** confirmar carregamento de todo o histórico ou existência de paginação/limites, critérios de datas, cancelamentos/estornos e comportamento em períodos sem dados.

### 12.6 Ciclo de vida e privacidade

O contexto contém rotinas relacionadas à exportação de dados e ao arquivamento de empresa. A exportação é comentada no código como relacionada ao art. 18 da LGPD. O arquivamento, conforme o trecho inspecionado, anonimiza usuários vinculados, encerra assinatura ativa, cancela pagamentos pendentes, marca movimentações para retenção e altera o status da empresa.

No trecho consultado, várias operações intermediárias de atualização não verificam explicitamente o erro retornado pelo Supabase antes de seguir para a próxima etapa. Isso pode produzir execução parcial. Não foi possível concluir, apenas pelo trecho, se há funções adicionais, políticas ou mecanismos compensatórios.

**Ponto prioritário:** revisar o fluxo completo, validar base legal, prazos de retenção, dados afetados e requisitos de exclusão/anonimização. Não considerar a implementação como comprovação de conformidade legal.

## 13. Priorização preliminar orientada à viabilidade comercial

| Prioridade | Tema | Por que importa |
|---|---|---|
| P0 — bloqueador comercial | RLS e isolamento entre empresas | Dados financeiros de clientes diferentes não podem ser expostos entre si |
| P0 — bloqueador comercial | Integridade de movimentações e conciliação | Valores incorretos comprometem confiança e decisões |
| P0 — bloqueador comercial | Permissões por papel e autorização no banco | Ações administrativas precisam ser protegidas no servidor/banco |
| P1 — alta | Auditoria confiável e histórico de alterações | Permite investigar erros e dar suporte |
| P1 — alta | Arquivamento, retenção e exclusão de dados | Evita perda parcial e riscos no ciclo de vida dos dados |
| P1 — alta | Testes automatizados dos cálculos financeiros | Reduz regressões em operações sensíveis |
| P1 — alta | Recuperação de falhas, logs e suporte | Necessário para operar um serviço pago |
| P2 — evolução | Usabilidade, onboarding e experiência mobile | Afeta adoção e retenção dos pequenos negócios |

As prioridades são hipóteses iniciais de risco e devem ser confirmadas após inspeção do banco, das políticas e dos fluxos completos.



## 14. Revisão documental do banco de dados

Foi localizado e revisado `docs/tecnica/banco-de-dados.md`, versão 2.0, que descreve 14 tabelas e declara RLS ativo em todas elas. A árvore completa da pasta `supabase/` nesta branch contém apenas `functions/criar-vendedor/index.ts`; não foram localizadas migrations, arquivos SQL de schema ou policies RLS versionadas.

A documentação descreve uma constraint de `empresas.status_acesso` que aceita apenas `ativo` e `suspenso`, embora o código de arquivamento tente gravar `arquivada`. O próprio documento registra essa migração como pendente. Também registra como pendente a proteção de imutabilidade de `audit_log`.

O fluxo de conciliação inspecionado grava diretamente em `conciliacoes`, enquanto o modelo também descreve `contas_bancarias` e `transacoes_bancarias`; essa diferença precisa ser esclarecida. A consistência entre `empresa_id` e `movimentacao_id`, e as permissões por papel, dependem de validação no banco.

O relatório detalhado está em [`docs/tecnica/REVISAO_BANCO_DADOS.md`](tecnica/REVISAO_BANCO_DADOS.md).

**Limite da evidência:** não houve conexão ao projeto Supabase em execução. Portanto, RLS, policies, constraints e schema implantado permanecem não verificados. Não executar correções SQL antes de exportar o estado atual e testar em ambiente isolado.
