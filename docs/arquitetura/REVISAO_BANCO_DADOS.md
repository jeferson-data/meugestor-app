# Revisão do banco de dados — Meu Gestor

- **Projeto:** Meu Gestor
- **Branch:** `docs/engenharia-software-scrum`
- **Data:** 13/11/2026
- **Status:** revisão documental e estática; não equivale a inspeção do banco Supabase em execução

## 1. Objetivo e limites

Esta revisão confronta a documentação de banco de dados existente com os arquivos da aplicação disponíveis no repositório. Não foi realizada conexão ao projeto Supabase nem consulta ao catálogo PostgreSQL. Portanto, não é possível confirmar o schema atualmente implantado, o estado efetivo do RLS ou as policies ativas.

## 2. Evidências consultadas

- `docs/tecnica/banco-de-dados.md` (versão 2.0, datada de 25/09/2026), incluindo o anexo com comandos `CREATE TABLE`;
- `src/contexts/AppContext.jsx`;
- `src/contexts/AuthContext.jsx`;
- `src/services/supabase.js`;
- `src/pages/Conciliacao.jsx`;
- `supabase/functions/criar-vendedor/index.ts`;
- árvore completa de `supabase/` na branch analisada.

## 3. Estrutura encontrada no repositório

A pasta `supabase/` contém somente:

- `functions/criar-vendedor/index.ts`.

Não foram encontrados na árvore desta branch:

- `supabase/migrations/`;
- arquivos SQL de criação/alteração de tabelas;
- arquivos SQL com policies RLS;
- configuração versionada do Supabase, como `supabase/config.toml`.

Isso significa que o repositório não apresenta, nesta branch, um histórico reproduzível de criação e evolução do banco. O documento `docs/tecnica/banco-de-dados.md` é uma especificação documental, não substitui migrations executáveis nem comprova o estado atual do ambiente.

## 4. Modelo relacional descrito na documentação

O documento de banco descreve 14 tabelas no schema `public`:

| Tabela | Finalidade descrita |
|---|---|
| `usuarios` | Perfil das pessoas que acessam o sistema, relacionado a `auth.users` |
| `empresas` | Estabelecimentos clientes |
| `user_empresas` | Associação de usuários e empresas, com papel por empresa |
| `movimentacoes` | Receitas e despesas |
| `planos` | Catálogo de planos e recursos |
| `assinaturas` | Contratos/planos vinculados a empresas |
| `pagamentos` | Cobranças e situação de pagamento |
| `audit_log` | Registro de eventos |
| `contas_bancarias` | Contas bancárias cadastradas por empresa |
| `transacoes_bancarias` | Transações importadas de extratos |
| `pedidos_contratacao` | Solicitações de contratação |
| `empresa_vendedores` | Associação de vendedores e empresas |
| `conciliacoes` | Associações confirmadas entre extrato e movimentação |
| `solicitacoes_exclusao` | Histórico de arquivamento/expurgo |

Convenções documentadas: UUID como chave primária, timestamps com fuso, datas em `DATE`, valores financeiros em centavos e nomes de colunas em `snake_case`.

## 5. Relação observada entre aplicação e tabelas

O `AppContext` consulta diretamente:

- `usuarios`;
- `empresas`;
- `user_empresas`;
- `movimentacoes`;
- `audit_log`;
- `conciliacoes`;
- `assinaturas`;
- `pagamentos`;
- `solicitacoes_exclusao`.

O hook `usePlano` consulta também `planos` por meio do relacionamento com `assinaturas`.

A tela `Conciliacao.jsx` lê o arquivo CSV/Excel no navegador, tenta identificar correspondências com as movimentações carregadas e confirma o par por meio de `AppContext`, que insere em `conciliacoes`.

**Diferença importante:** a documentação também descreve `contas_bancarias` e `transacoes_bancarias`, mas o fluxo de conciliação inspecionado não as utiliza. Não concluir que são inúteis ou abandonadas sem inventariar todas as referências do repositório e o banco ativo.

## 6. Achados e inconsistências que exigem ação

### BD-01 — Ausência de migrations e policies versionadas no repositório

**Evidência:** a árvore `supabase/` contém apenas uma Edge Function. O documento do banco declara RLS ativo nas 14 tabelas, mas o anexo SQL consultado contém definições de tabelas e não apresenta o conjunto de comandos `CREATE POLICY` nem as expressões de autorização.

**Impacto:** não há, no repositório, uma fonte executável e revisável para reconstruir o banco ou auditar as permissões. A afirmação de RLS ativo não foi verificada no ambiente.

**Prioridade:** P0 — bloqueador para validação comercial.

**Ação:** obter do Supabase o schema atual e as policies, sem compartilhar chaves ou segredos; exportar migrations/schema e policies para o repositório após revisão.

### BD-02 — Restrição de status de empresa incompatível com arquivamento

**Evidência documental:** o anexo SQL define `empresas.status_acesso` com CHECK limitado a `ativo` e `suspenso`. A seção de migração pendente reconhece a necessidade de incluir `arquivada`. O `AppContext` tenta atualizar a empresa para `arquivada`.

**Impacto:** se a constraint do banco ativo for a mesma descrita no anexo, o arquivamento falha ao gravar esse status.

**Prioridade:** P0 — fluxo de ciclo de vida.

**Ação:** verificar a constraint no banco ativo e preparar migration versionada, com backup e teste em ambiente não produtivo antes de executar.

### BD-03 — RLS declarado sem evidência das policies

**Evidência:** o documento afirma que todas as 14 tabelas têm RLS habilitado, mas não registra as expressões de `USING` e `WITH CHECK` das policies nem a matriz de operações por papel.

**Impacto:** RLS habilitado sem policies corretas pode bloquear o uso legítimo ou permitir acesso indevido, conforme grants, policies e contexto de execução.

**Prioridade:** P0.

**Ação:** documentar por tabela e operação (SELECT, INSERT, UPDATE, DELETE), papéis autorizados, condições de empresa e relação com `auth.uid()`. Testar com usuários de empresas diferentes e papéis dono/operador/leitor.

### BD-04 — Integridade da associação entre conciliação e movimentação

**Evidência:** o código insere em `conciliacoes` `empresa_id` e `movimentacao_id` enviados a partir do cliente. A documentação apresenta FKs individuais para empresa e movimentação, mas não demonstra constraint composta que garanta que ambas pertencem à mesma empresa.

**Impacto:** sem validação no banco, uma chamada manipulada pode tentar associar uma movimentação de uma empresa a outra empresa, caso as policies também não impeçam.

**Prioridade:** P0.

**Ação:** validar pertencimento no banco por policy/constraint ou função transacional segura. Testar chamadas cruzadas.

### BD-05 — Auditoria não está garantida como parte atômica da operação

**Evidência:** `AppContext` executa a operação principal e depois tenta inserir em `audit_log`. O registro de auditoria captura falhas sem reverter a operação principal. O documento do banco também indica como pendente a criação de trigger que bloqueie UPDATE/DELETE.

**Impacto:** podem existir alterações financeiras sem evento de auditoria correspondente; o histórico pode não ser imutável.

**Prioridade:** P1, elevar a P0 para operações que exigem rastreabilidade obrigatória.

**Ação:** definir eventos obrigatórios e implementar auditoria no banco ou em função transacional, com política de leitura e proteção contra alteração.

### BD-06 — Diferenças entre o modelo documentado e o fluxo de conciliação

**Evidência:** o modelo descreve `contas_bancarias` e `transacoes_bancarias`, mas o fluxo de tela inspecionado processa o arquivo no navegador e grava os pares diretamente em `conciliacoes`.

**Impacto:** o modelo pode conter estruturas não utilizadas pelo fluxo atual ou a documentação pode descrever uma arquitetura diferente da implementação.

**Prioridade:** P1.

**Ação:** decidir se a conciliação atual é a arquitetura pretendida para o piloto; atualizar modelo e fluxos para refletir a implementação aprovada.

### BD-07 — Papéis documentados precisam ser confrontados com autorização efetiva

**Evidência:** a documentação define papéis globais e papéis por empresa (`dono`, `operador`, `leitor`). O contexto carrega o papel do vínculo, mas o trecho de CRUD de movimentações não mostra checagem explícita de papel antes de atualizar/excluir; essa autorização pode depender das policies do banco.

**Impacto:** controles de interface não são suficientes para impedir chamadas diretas à API.

**Prioridade:** P0.

**Ação:** testar cada operação por papel e garantir autorização no banco, sem confiar exclusivamente no frontend.

## 7. Matriz inicial de confiança

| Afirmação | Estado nesta revisão |
|---|---|
| O projeto documenta 14 tabelas | Confirmado no arquivo de documentação |
| O app consulta várias dessas tabelas | Confirmado nos arquivos de frontend inspecionados |
| O banco implantado tem exatamente essas 14 tabelas | Não verificado |
| Todas as tabelas têm RLS ativo no ambiente | Declarado, não verificado |
| As policies impedem acesso cruzado entre empresas | Não verificado |
| O CHECK de empresa permite `arquivada` no ambiente | Não verificado; o SQL anexado não permite |
| A auditoria é imutável | Não; o documento registra trigger como pendente |
| A conciliação garante vínculo empresa/movimentação | Não demonstrado |

## 8. Plano de validação no Supabase

Antes de qualquer alteração no banco:

1. Confirmar qual projeto Supabase corresponde ao deploy de teste e ao deploy de produção.
2. Exportar schema e policies atuais por ferramenta oficial/SQL Editor, sem expor `service_role`, tokens ou credenciais.
3. Comparar as tabelas, colunas, constraints, índices, triggers, funções e policies com `docs/tecnica/banco-de-dados.md`.
4. Criar um ambiente de teste ou usar projeto de desenvolvimento isolado.
5. Escrever migrations numeradas para corrigir divergências aprovadas.
6. Testar com pelo menos duas empresas e três papéis (dono, operador e leitor).
7. Só então aplicar migrations em produção com backup e plano de reversão.

## 9. Backlog técnico proposto

| ID | História/atividade | Prioridade | Critério de aceite |
|---|---|---|---|
| BD-01 | Versionar schema e policies em migrations | P0 | Banco de teste pode ser reconstruído a partir do repositório |
| BD-02 | Corrigir e testar status de arquivamento | P0 | Empresa pode ser arquivada em teste sem violar constraints |
| BD-03 | Validar RLS em todas as tabelas | P0 | Testes negativos comprovam que usuário não lê/altera dados de outra empresa |
| BD-04 | Garantir consistência empresa/conciliação/movimentação | P0 | Banco rejeita associação entre registros de empresas diferentes |
| BD-05 | Garantir autorização por papel no banco | P0 | Dono, operador e leitor só executam operações autorizadas |
| BD-06 | Tornar auditoria confiável | P1 | Eventos críticos são registrados e não podem ser alterados por cliente |
| BD-07 | Alinhar modelo e implementação de conciliação | P1 | Documentação descreve o fluxo real aprovado |
| BD-08 | Verificar índices e plano de consulta | P2 | Consultas frequentes têm índices justificados e medição básica |

## 10. Próxima etapa

A próxima etapa depende da exportação do schema e das policies do projeto Supabase. Até receber essas evidências, não executar SQL corretivo nem afirmar que o banco está seguro ou inseguro. Manter todas as alterações documentais nesta branch.
