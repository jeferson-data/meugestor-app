# Banco de Dados

**Versão:** 1.1
**Data:** 2026-09-25
**Banco:** PostgreSQL (Supabase)

Este documento descreve a estrutura do banco de dados do MeuGestor:
todas as tabelas, colunas, relacionamentos e políticas de acesso.

---

## 1. Visão geral

O banco é hospedado no **Supabase** (PostgreSQL) e organizado no schema
`public`. Todas as tabelas usam **Row Level Security (RLS)** para garantir
isolamento entre empresas.

### Diagrama de relacionamentos

┌──────────────┐
│ usuarios │◄──── auth.users.id
└──────┬───────┘
│
┌──────────────┼───────────────┬──────────────┐
│ │ │ │
▼ ▼ ▼ ▼
┌───────────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────┐
│ user_empresas │ │audit_log │ │ pagamentos │ │empresa_ │
└───────┬───────┘ └────┬─────┘ └──────┬───────┘ │vendedores │
│ │ │ └──────┬─────────┘
▼ │ │ │
┌───────────────┐ │ │ │
│ empresas │◄─────┴──────────────┴────────────────┘
└───────┬───────┘
│
┌─────────┼─────────┬─────────────┬──────────────┬───────────────┐
│ │ │ │ │ │
▼ ▼ ▼ ▼ ▼ ▼
┌─────────┐ ┌───────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│movimen- │ │conci- │ │assinatu- │ │contas_ │ │pedidos_ │ │solicita- │
│tacoes │ │liacoes│ │ras │ │bancarias │ │contrata- │ │coes_ │
└─────────┘ └───────┘ └──────────┘ └────┬─────┘ │cao │ │exclusao │
│ └──────────┘ └────────────┘
▼
┌────────────────┐
│transacoes_ │
│bancarias │
└────────────────┘


### Lista de tabelas

| Tabela | O que guarda |
|--------|--------------|
| `usuarios` | Dados de todas as pessoas que acessam o sistema |
| `empresas` | Empresas clientes do MeuGestor |
| `user_empresas` | Vínculo N:N entre usuários e empresas (com papel) |
| `movimentacoes` | Entradas e saídas financeiras |
| `audit_log` | Trilha de auditoria das ações |
| `planos` | Catálogo dos 3 planos (Básico, Padrão, Completo) |
| `assinaturas` | Assinatura ativa de cada empresa |
| `pagamentos` | Histórico de cobranças |
| `conciliacoes` | Pares confirmados na conciliação por arquivo |
| `contas_bancarias` | Contas bancárias cadastradas por empresa |
| `transacoes_bancarias` | Transações importadas do banco |
| `empresa_vendedores` | Vínculo N:N entre empresas e vendedores |
| `pedidos_contratacao` | Solicitações de contratação via formulário |
| `solicitacoes_exclusao` | Histórico de empresas arquivadas |

---

## 2. Convenções

- **Nomes em `snake_case`** (`empresa_id`, `valor_centavos`).
- **Chaves primárias em UUID** (`id`, gerado por `gen_random_uuid()`).
- **Chaves estrangeiras com sufixo `_id`** (`empresa_id`, `usuario_id`).
- **Timestamps em UTC** com tipo `TIMESTAMPTZ`.
- **Valores monetários em centavos** (inteiro, nunca negativo).
- **Datas sem hora** com tipo `DATE` (ex.: `data` em `movimentacoes`).
- **Status** sempre em `TEXT` com `CHECK` para valores permitidos.
- **Timestamps de criação** são nomeados `criado_em` (não `created_at`).

---

## 3. Tabelas

### 3.1 usuarios

Pessoas que acessam o sistema: donos de conta, operadores e vendedores.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK. Mesmo ID do `auth.users` do Supabase |
| `nome` | TEXT | Não | Nome completo |
| `email` | TEXT | Não | E-mail (usado no login) |
| `telefone` | TEXT | Sim | WhatsApp com DDD |
| `role` | TEXT | Não | `admin_programa`, `dono_programa`, `dono`, `funcionario` |
| `ativo` | BOOLEAN | Sim | Se o usuário está ativo (default `true`) |
| `comissao_percentual` | NUMERIC | Sim | Percentual de comissão (para vendedores) |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |
| `anonimizado_em` | TIMESTAMPTZ | Sim | Quando o titular foi anonimizado (LGPD) |
| `motivo_exclusao` | TEXT | Sim | Motivo do arquivamento (LGPD) |

**Regras de negócio:**
- `id` é preenchido automaticamente quando o Supabase Auth cria o usuário.
- `role = 'admin_programa'` ou `'dono_programa'` → acesso administrativo total.
- `role = 'dono'` → dono de uma empresa específica (via `user_empresas`).
- `role = 'funcionario'` → acesso limitado (só lançamentos, extrato e dashboard).
- `comissao_percentual` só faz sentido para vendedores.
- Ao arquivar uma empresa, os usuários vinculados são anonimizados:
  - `nome` → `[titular excluído]`
  - `email` → `anon-xxxxxxxxxxxx@excluido.local`
  - `telefone` → `NULL`

**RLS:** ativo. Usuário só vê a própria linha. Admin vê todas.

---

### 3.2 empresas

Empresas clientes do MeuGestor.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `nome` | TEXT | Não | Nome ou razão social |
| `nome_fantasia` | TEXT | Sim | Nome curto |
| `cnpj` | TEXT | Sim | CNPJ |
| `telefone` | TEXT | Sim | Telefone comercial |
| `email` | TEXT | Sim | E-mail comercial |
| `endereco` | TEXT | Sim | Endereço completo |
| `vendedor_id` | UUID | Sim | FK para `usuarios.id` (vendedor responsável) |
| `status_acesso` | TEXT | Não | `ativo`, `suspenso`, `arquivada` |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |
| `arquivada_em` | TIMESTAMPTZ | Sim | Data do arquivamento |
| `expurgo_em` | TIMESTAMPTZ | Sim | Data em que os dados podem ser apagados (+5 anos) |
| `motivo_exclusao` | TEXT | Sim | Motivo do arquivamento |

> **Observação:** o segmento da empresa **não é armazenado** em `empresas`.
> Ele fica apenas em `pedidos_contratacao` no momento da solicitação.

**Regras de negócio:**
- Ao criar uma empresa, criar também uma linha em `assinaturas` e uma
  em `pagamentos`.
- Empresas com `status_acesso = 'arquivada'` **não aparecem** nas listas
  (a query do `AppContext` filtra com `.neq('status_acesso', 'arquivada')`).
- O `expurgo_em` é definido como `hoje + 5 anos` no momento do arquivamento.

**RLS:** ativo. Usuário só vê empresas às quais está vinculado.
Admin vê todas.

---

### 3.3 user_empresas

Vínculo N:N entre usuários e empresas. Define qual papel o usuário
tem em cada empresa.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `usuario_id` | UUID | Não | FK para `usuarios.id` |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `papel` | TEXT | Não | `dono` ou `funcionario` |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |

**Regras de negócio:**
- Um usuário pode estar vinculado a várias empresas.
- Um usuário pode ter papéis diferentes em empresas diferentes.
- O `role` em `usuarios` é global (admin ou não). O `papel` aqui é
  específico por empresa.
- Ao arquivar uma empresa, os vínculos **não são removidos** — são mantidos
  para preservar o histórico.

**RLS:** ativo. Usuário vê apenas os próprios vínculos. Admin vê todos.

---

### 3.4 movimentacoes

Entradas e saídas financeiras de cada empresa.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `tipo` | TEXT | Não | `receita` ou `despesa` |
| `categoria` | TEXT | Sim | Categoria padronizada (ver seção 4) |
| `descricao` | TEXT | Sim | Texto livre |
| `valor_centavos` | BIGINT | Não | Valor em centavos (sempre positivo) |
| `data` | DATE | Não | Data do lançamento |
| `status` | TEXT | Não | `pago` ou `pendente` |
| `lancado_por` | TEXT | Sim | Nome de quem lançou |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |
| `retida_ate` | TIMESTAMPTZ | Sim | Retenção fiscal (preenchido ao arquivar) |

**Regras de negócio:**
- `valor_centavos` nunca é negativo. A direção vem do `tipo`.
- `categoria` precisa pertencer à lista fechada de `CATEGORIAS[tipo]`:
  - **receita:** Vendas, Serviços, Maquininha de cartão, Outros ganhos
  - **despesa:** Mercadorias e fornecedores, Contas do negócio,
    Funcionários, Retirada do dono, Outros gastos
- `lancado_por` é preenchido automaticamente com `perfil.nome`.
- Ao arquivar uma empresa, `retida_ate` recebe `hoje + 5 anos`.

**RLS:** ativo. Usuário só vê movimentações de empresas às quais está
vinculado.

**Índices recomendados:**
- `empresa_id`
- `data`
- `status`

---

### 3.5 audit_log

Trilha de auditoria das ações críticas.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `usuario_id` | UUID | Sim | FK para `usuarios.id` |
| `usuario_nome` | TEXT | Não | Nome do usuário no momento da ação |
| `acao` | TEXT | Não | Descrição textual da ação |
| `quando` | TIMESTAMPTZ | Sim | Data e hora da ação |

**Regras de negócio:**
- Toda ação relevante insere uma linha aqui (lançamento, edição,
  exclusão, conciliação, arquivamento).
- O campo `usuario_nome` é redundante com `usuarios.nome` — guardado
  para preservar o histórico mesmo se o usuário for anonimizado.
- Esta tabela deve ser **imutável** (LGPD). Idealmente, com trigger
  que bloqueia `UPDATE` e `DELETE`.

**RLS:** ativo. Admin vê tudo. Usuário comum vê só as próprias ações
(se aplicável).

---

### 3.6 planos

Catálogo dos planos oferecidos.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `nome` | TEXT | Não | `Básico`, `Padrão`, `Completo` |
| `valor_centavos` | BIGINT | Não | Valor mensal em centavos |
| `limite_usuarios` | INTEGER | Não | 1, 3 ou 999 |
| `recursos` | JSONB | Sim | Recursos disponíveis (ex.: `{"conciliacao": true}`) |
| `ativo` | BOOLEAN | Não | Se o plano está disponível para contratação |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |

**Regras de negócio:**
- Planos ativos: Básico (R$ 49), Padrão (R$ 89), Completo (R$ 149).
- `limite_usuarios` define quantos utilizadores a empresa pode ter.
- `recursos` é usado pelo hook `usePlano` para liberar/bloquear
  funcionalidades (ex.: conciliação bancária só no Completo).

**RLS:** ativo. Todos os usuários autenticados podem ler planos ativos.
Só admin pode editar.

---

### 3.7 assinaturas

Assinatura ativa (ou histórica) de cada empresa.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `plano_id` | UUID | Não | FK para `planos.id` |
| `inicio_contrato` | DATE | Não | Data de início |
| `fim_contrato` | DATE | Não | Data de término |
| `valor_centavos` | BIGINT | Não | Valor mensal em centavos |
| `status` | TEXT | Não | `ativo`, `cancelado`, `expirado` |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |

**Regras de negócio:**
- Uma empresa tem no máximo **uma** assinatura com `status = 'ativo'`.
- Ao alterar o plano, a assinatura atual vira `cancelado` e uma nova
  com `status = 'ativo'` é criada (via função RPC `alterar_plano_empresa`).
- Ao arquivar empresa, todas as assinaturas ativas viram `cancelado`.

**RLS:** ativo. Admin vê tudo. Usuário vê da própria empresa.

---

### 3.8 pagamentos

Histórico de cobranças.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `mes_referencia` | DATE | Não | Mês de competência (ex.: `2026-09-01`) |
| `valor_centavos` | BIGINT | Não | Valor em centavos |
| `status` | TEXT | Não | `pendente`, `pago`, `cancelado` |
| `data_pagamento` | DATE | Sim | Data efetiva do pagamento |
| `registrado_por` | UUID | Sim | FK para `usuarios.id` (quem marcou como pago) |
| `observacao` | TEXT | Sim | Anotação livre |
| `criado_em` | TIMESTAMPTZ | Sim | Data de criação |

**Regras de negócio:**
- Uma linha por mês, por empresa.
- Ao criar empresa, é gerado um pagamento com `status = 'pendente'`.
- Ao marcar como pago, preencher `data_pagamento` e `registrado_por`.
- Ao arquivar empresa, todos os pagamentos pendentes viram `cancelado`.

**RLS:** ativo. Admin vê tudo. Usuário vê da própria empresa.

---

### 3.9 conciliacoes

Pares confirmados na conciliação por arquivo (CSV/XLSX).

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `movimentacao_id` | UUID | Não | FK para `movimentacoes.id` |
| `data_arquivo` | DATE | Não | Data do item no extrato |
| `descricao_arquivo` | TEXT | Não | Descrição do item no extrato |
| `valor_centavos` | BIGINT | Não | Valor do item no extrato |
| `status` | TEXT | Não | `conciliado` ou `rejeitado` |
| `confirmado_por` | TEXT | Sim | Nome de quem confirmou |
| `confirmado_em` | TIMESTAMPTZ | Sim | Data/hora da confirmação |

**Regras de negócio:**
- Um `movimentacao_id` só pode aparecer uma vez com `status = 'conciliado'`.
- Itens rejeitados são guardados como histórico.
- Ao excluir uma movimentação, as conciliações ligadas a ela são removidas.

**RLS:** ativo. Usuário vê da própria empresa.

---

### 3.10 contas_bancarias

Contas bancárias cadastradas por empresa.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| ⚠️ demais campos | — | — | ⚠️ Confirmar no Supabase |

**Regras de negócio:**
- Uma empresa pode ter várias contas.
- ⚠️ Verificar se há campos adicionais (banco, agência, conta, tipo, saldo).

**RLS:** ativo. Usuário vê da própria empresa.

---

### 3.11 transacoes_bancarias

Transações importadas do banco.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `conta_id` | UUID | Não | FK para `contas_bancarias.id` |
| `movimentacao_id` | UUID | Sim | FK para `movimentacoes.id` (quando conciliada) |
| ⚠️ demais campos | — | — | ⚠️ Confirmar no Supabase |

**Regras de negócio:**
- Quando uma transação é conciliada com uma movimentação, `movimentacao_id`
  é preenchido.
- Transações não conciliadas têm `movimentacao_id = NULL`.

**RLS:** ativo. Usuário vê da própria empresa.

---

### 3.12 empresa_vendedores

Vínculo N:N entre empresas e vendedores (representantes do MeuGestor).

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Não | FK para `empresas.id` |
| `vendedor_id` | UUID | Não | FK para `usuarios.id` |

**Regras de negócio:**
- Vendedores são representantes comerciais do MeuGestor.
- Uma empresa pode ter mais de um vendedor vinculado.
- O campo `empresas.vendedor_id` guarda o vendedor principal (opcional).

**RLS:** ativo. Admin vê tudo.

---

### 3.13 pedidos_contratacao

Solicitações de contratação enviadas pelo formulário público.

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `telefone_operador` | TEXT | Sim | Telefone/WhatsApp do operador |
| `observacoes` | TEXT | Sim | Mensagem livre do solicitante |
| `status` | TEXT | Não | `pendente`, `aprovado`, `rejeitado` |
| `criado_em` | TIMESTAMPTZ | Sim | Data de envio |
| `vendedor_id` | UUID | Sim | FK para `usuarios.id` (quem indicou) |
| ⚠️ demais campos | — | — | ⚠️ Confirmar no Supabase |

> **Observação:** a imagem do schema mostra que esta tabela tem relação
> com `usuarios` (via `vendedor_id`). Os demais campos (empresa, responsável,
> plano, vencimento) precisam ser confirmados no painel do Supabase.

**Regras de negócio:**
- Ao aprovar um pedido:
  - Cria empresa em `empresas`.
  - Cria usuário em `usuarios` + `auth.users`.
  - Vincula usuário à empresa em `user_empresas`.
  - Cria assinatura em `assinaturas`.
  - Cria pagamento pendente em `pagamentos`.
  - Marca `status = 'aprovado'`.
- Ao rejeitar, marca `status = 'rejeitado'` e mantém para histórico.

**RLS:** ativo. Apenas admin pode ler. Inserção via formulário público
(role `anon`).

---

### 3.14 solicitacoes_exclusao

Histórico de empresas arquivadas (LGPD).

| Coluna | Tipo | Nulo? | Descrição |
|--------|------|:---:|-----------|
| `id` | UUID | Não | PK |
| `empresa_id` | UUID | Sim | FK para `empresas.id` |
| `empresa_nome` | TEXT | Sim | Nome da empresa no momento do arquivamento |
| `usuario_id` | UUID | Sim | FK para `usuarios.id` (quem executou) |
| `usuario_nome` | TEXT | Sim | Nome de quem executou |
| `motivo` | TEXT | Sim | Motivo declarado |
| `arquivada_em` | TIMESTAMPTZ | Sim | Data do arquivamento |
| `expurgo_em` | TIMESTAMPTZ | Não | Data prevista para expurgo (+5 anos) |
| `status` | TEXT | Não | `arquivada` ou `expurgada` |
| `observacoes` | TEXT | Sim | Campo livre |

**Regras de negócio:**
- Uma linha por empresa arquivada.
- Serve como prova de conformidade com a LGPD.
- Depois do expurgo, `status` vira `expurgada`.

**RLS:** ativo. Apenas admin lê e escreve.

---

## 4. Categorias de movimentação

Definidas em `src/utils/categorias.js` e validadas no `AppContext`:

| Tipo | Categorias permitidas |
|------|----------------------|
| `receita` | Vendas, Serviços, Maquininha de cartão, Outros ganhos |
| `despesa` | Mercadorias e fornecedores, Contas do negócio, Funcionários, Retirada do dono, Outros gastos |

Qualquer tentativa de inserir categoria fora desta lista é rejeitada
pelo `adicionarMovimentacao`.

---

## 5. Estados da empresa

| Status | Significado | Cliente pode logar? | Dados pessoais |
|--------|-------------|:---:|:---:|
| `ativo` | Cliente pagando em dia | ✅ | Mantidos |
| `suspenso` | Venceu, não pagou | ❌ | Mantidos |
| `arquivada` | Excluída pelo admin | ❌ | Anonimizados |

Estados e prazos detalhados em [`docs/ciclo-de-vida.md`](../ciclo-de-vida.md).

---

## 6. Segurança (RLS)

**Todas as 14 tabelas têm RLS ativo.** ✅

Padrões usados:

| Padrão | Tabelas | Regra |
|--------|---------|-------|
| **Isolamento por empresa** | `movimentacoes`, `conciliacoes`, `contas_bancarias`, `transacoes_bancarias`, `assinaturas`, `pagamentos` | Usuário vê apenas dados de empresas às quais está vinculado via `user_empresas` |
| **Admin total** | `pedidos_contratacao`, `solicitacoes_exclusao` | Somente `admin_programa` e `dono_programa` |
| **Próprio usuário** | `usuarios` | Usuário vê a própria linha; admin vê todas |
| **Público (leitura)** | `planos` | Qualquer autenticado lê planos ativos |
| **Público (inserção)** | `pedidos_contratacao` | Formulário público pode inserir; só admin lê |

---

## 7. Migrações

As migrações SQL ficam em `supabase/`. Recomendações:

- **Uma migração por mudança de schema.** Não agrupar várias alterações.
- **Nomes descritivos.** Ex.: `20260925_add_campos_arquivamento.sql`.
- **Sempre com `IF NOT EXISTS` / `IF EXISTS`** para não quebrar em
  ambientes diferentes.
- **Sempre testar em ambiente de desenvolvimento antes de produção.**

---

## 8. Backups

- **Supabase** faz backup diário automático (plano gratuito: retenção
  de 7 dias).
- **Recomendado:** exportar manualmente um dump completo uma vez por
  mês e guardar em local externo (Google Drive).
- **Antes de qualquer migração destrutiva**, fazer backup manual.

---

## 9. Pendências

- [ ] Confirmar campos exatos da tabela `transacoes_bancarias`
- [ ] Confirmar campos exatos da tabela `contas_bancarias`
- [ ] Confirmar campos exatos da tabela `pedidos_contratacao`
- [ ] Criar trigger que torna `audit_log` imutável (LGPD)
- [ ] Criar job de expurgo automático (pg_cron)
- [ ] Definir índices recomendados para `movimentacoes`
- [ ] Revisar se `planos` realmente tem coluna `recursos` do tipo JSONB

---

## 10. Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial com base no schema real | Jeferson |
| 1.1 | 2026-09-25 | Ajuste de campos após visualização do diagrama | Jeferson |