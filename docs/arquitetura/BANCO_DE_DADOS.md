# Banco de Dados

**Versão:** 2.0
**Data:** 2026-09-25
**Banco:** PostgreSQL (Supabase)

Este documento descreve a estrutura completa do banco de dados do
MeuGestor: todas as tabelas, colunas, restrições e relacionamentos.

O schema real está documentado na seção [Anexo A](#anexo-a--schema-sql-completo).

---

## 1. Visão geral

O banco é hospedado no **Supabase** (PostgreSQL) e organizado no schema
`public`. Todas as 14 tabelas usam **Row Level Security (RLS)**.

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

| Tabela | O que guarda | RLS |
|--------|--------------|:---:|
| `usuarios` | Pessoas que acessam o sistema | ✅ |
| `empresas` | Empresas clientes | ✅ |
| `user_empresas` | Vínculo N:N usuário ↔ empresa | ✅ |
| `movimentacoes` | Entradas e saídas financeiras | ✅ |
| `planos` | Catálogo dos 3 planos | ✅ |
| `assinaturas` | Assinatura de cada empresa | ✅ |
| `pagamentos` | Histórico de cobranças | ✅ |
| `audit_log` | Trilha de auditoria | ✅ |
| `contas_bancarias` | Contas bancárias por empresa | ✅ |
| `transacoes_bancarias` | Transações importadas do banco | ✅ |
| `pedidos_contratacao` | Solicitações via formulário público | ✅ |
| `empresa_vendedores` | Vínculo N:N empresa ↔ vendedor | ✅ |
| `conciliacoes` | Pares confirmados na conciliação | ✅ |
| `solicitacoes_exclusao` | Histórico de empresas arquivadas | ✅ |

---

## 2. Convenções

- **Nomes em `snake_case`** (`empresa_id`, `valor_centavos`).
- **Chaves primárias em UUID** (`id`).
- **Chaves estrangeiras com sufixo `_id`** (`empresa_id`, `usuario_id`).
- **Timestamps em UTC** com tipo `TIMESTAMPTZ`.
- **Valores monetários em centavos** (inteiro, sempre positivo).
- **Datas sem hora** com tipo `DATE`.
- **Status e papéis** sempre em `TEXT` com `CHECK`.
- **Timestamps de criação** são nomeados `criado_em` (exceto `conciliacoes`,
  que usa `created_at` por inconsistência histórica).

---

## 3. Tabelas

### 3.1 usuarios

Pessoas que acessam o sistema.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | — | PK. Mesmo ID do `auth.users` |
| `nome` | TEXT | Não | — | Nome completo |
| `email` | TEXT | Não | — | E-mail único (login) |
| `telefone` | TEXT | Sim | — | WhatsApp com DDD |
| `role` | TEXT | Não | `dono_cliente` | Papel global |
| `ativo` | BOOLEAN | Sim | `true` | Se o usuário pode acessar |
| `comissao_percentual` | NUMERIC | Sim | `20.00` | Comissão de vendedores |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |
| `anonimizado_em` | TIMESTAMPTZ | Sim | — | Quando foi anonimizado (LGPD) |
| `motivo_exclusao` | TEXT | Sim | — | Motivo do arquivamento |

**Valores possíveis de `role`:**
- `admin_programa` — administrador do MeuGestor (você)
- `dono_programa` — coproprietário do MeuGestor
- `vendedor` — representante comercial
- `dono_cliente` — dono de uma empresa cliente (default)

**Regras de negócio:**
- `id` é preenchido automaticamente pelo Supabase Auth.
- Ao arquivar uma empresa, os usuários vinculados são anonimizados:
  - `nome` → `[titular excluído]`
  - `email` → `anon-xxxxxxxxxxxx@excluido.local`
  - `telefone` → `NULL`

**RLS:** ativo. Usuário vê a própria linha; admin vê todas.

---

### 3.2 empresas

Empresas clientes do MeuGestor.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `nome` | TEXT | Não | — | Nome ou razão social |
| `nome_fantasia` | TEXT | Sim | — | Nome curto |
| `cnpj` | TEXT | Sim | — | CNPJ |
| `telefone` | TEXT | Sim | — | Telefone comercial |
| `email` | TEXT | Sim | — | E-mail comercial |
| `endereco` | TEXT | Sim | — | Endereço completo |
| `vendedor_id` | UUID | Sim | — | FK → `usuarios.id` |
| `status_acesso` | TEXT | Não | `ativo` | `ativo`, `suspenso`, `arquivada` |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |
| `arquivada_em` | TIMESTAMPTZ | Sim | — | Data do arquivamento |
| `expurgo_em` | TIMESTAMPTZ | Sim | — | Data prevista para expurgo (+5 anos) |
| `motivo_exclusao` | TEXT | Sim | — | Motivo do arquivamento |

**Regras de negócio:**
- Empresas com `status_acesso = 'arquivada'` não aparecem nas listas.
- O `expurgo_em` é definido como `hoje + 5 anos` no arquivamento.
- Não armazena `segmento` — fica só em `pedidos_contratacao`.

⚠️ **Importante:** a constraint `CHECK` atual só permite `ativo` e
`suspenso`. Precisa incluir `arquivada` (ver seção 8).

---

### 3.3 user_empresas

Vínculo N:N entre usuários e empresas.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `usuario_id` | UUID | Não | — | FK → `usuarios.id` |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `papel` | TEXT | Não | `dono` | Papel na empresa |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**Valores possíveis de `papel`:**
- `dono` — controle total da empresa
- `operador` — só lança movimentações (equivalente ao "funcionário")
- `leitor` — apenas consulta

**RLS:** ativo.

---

### 3.4 movimentacoes

Entradas e saídas financeiras.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `tipo` | TEXT | Não | — | `receita` ou `despesa` |
| `categoria` | TEXT | Sim | — | Categoria padronizada (ver seção 4) |
| `descricao` | TEXT | Sim | — | Texto livre |
| `valor_centavos` | INTEGER | Não | — | Valor em centavos (> 0) |
| `data` | DATE | Não | `CURRENT_DATE` | Data do lançamento |
| `status` | TEXT | Não | `pendente` | `pendente` ou `pago` |
| `lancado_por` | TEXT | Sim | — | Nome de quem lançou |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |
| `retida_ate` | TIMESTAMPTZ | Sim | — | Retenção fiscal (+5 anos) |

**Regras de negócio:**
- `valor_centavos > 0` é garantido por CHECK.
- `categoria` precisa pertencer a `CATEGORIAS[tipo]`.
- `lancado_por` é preenchido automaticamente.

**RLS:** ativo.

---

### 3.5 planos

Catálogo dos planos.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `nome` | TEXT | Não | — | `Básico`, `Padrão`, `Completo` |
| `descricao` | TEXT | Sim | — | Texto descritivo |
| `valor_centavos` | INTEGER | Não | — | Valor mensal (> 0) |
| `recursos` | JSONB | Sim | `{}` | Recursos disponíveis |
| `ativo` | BOOLEAN | Sim | `true` | Disponível para contratação |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**Regras de negócio:**
- Limite de utilizadores e liberação de conciliação ficam dentro do
  JSONB `recursos` (ex.: `{"limite_usuarios": 3, "conciliacao": true}`).

**RLS:** ativo. Autenticados leem; só admin edita.

---

### 3.6 assinaturas

Assinatura ativa (ou histórica) de cada empresa.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `plano_id` | UUID | Não | — | FK → `planos.id` |
| `inicio_contrato` | DATE | Não | `CURRENT_DATE` | Início |
| `fim_contrato` | DATE | Não | — | Término |
| `valor_centavos` | INTEGER | Não | — | Valor mensal (> 0) |
| `status` | TEXT | Não | `ativo` | `ativo`, `suspenso`, `cancelado` |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**RLS:** ativo.

---

### 3.7 pagamentos

Histórico de cobranças.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `mes_referencia` | DATE | Não | — | Mês de competência |
| `valor_centavos` | INTEGER | Não | — | Valor (> 0) |
| `status` | TEXT | Não | `pendente` | `pago`, `pendente`, `atrasado` |
| `data_pagamento` | DATE | Sim | — | Data efetiva |
| `registrado_por` | UUID | Sim | — | FK → `usuarios.id` |
| `observacao` | TEXT | Sim | — | Anotação livre |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**RLS:** ativo.

---

### 3.8 audit_log

Trilha de auditoria.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Sim | — | FK → `empresas.id` |
| `usuario_id` | UUID | Sim | — | FK → `usuarios.id` |
| `usuario_nome` | TEXT | Sim | — | Nome no momento da ação |
| `acao` | TEXT | Não | — | Descrição textual |
| `quando` | TIMESTAMPTZ | Sim | `now()` | Data e hora |

**Regras de negócio:**
- `empresa_id` e `usuario_id` podem ser nulos (ações administrativas globais).
- Deve ser **imutável** (LGPD). Falta trigger bloqueando UPDATE/DELETE.

**RLS:** ativo.

---

### 3.9 contas_bancarias

Contas bancárias por empresa.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `banco` | TEXT | Não | — | Nome do banco |
| `agencia` | TEXT | Sim | — | Número da agência |
| `numero_conta` | TEXT | Sim | — | Número da conta |
| `ativo` | BOOLEAN | Sim | `true` | Se está ativa |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**RLS:** ativo.

---

### 3.10 transacoes_bancarias

Transações importadas do banco (via conciliação).

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `conta_id` | UUID | Sim | — | FK → `contas_bancarias.id` |
| `data` | DATE | Não | — | Data da transação |
| `descricao` | TEXT | Sim | — | Descrição |
| `valor_centavos` | INTEGER | Não | — | Valor (pode ser negativo) |
| `conciliado` | BOOLEAN | Sim | `false` | Se já foi conciliada |
| `movimentacao_id` | UUID | Sim | — | FK → `movimentacoes.id` |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

> **Nota:** diferente de `movimentacoes`, aqui `valor_centavos` pode ser
> negativo (representa débito).

**RLS:** ativo.

---

### 3.11 pedidos_contratacao

Solicitações de contratação via formulário público.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `uuid_generate_v4()` | PK |
| `nome_empresa` | TEXT | Não | — | Empresa solicitante |
| `nome_fantasia` | TEXT | Sim | — | Nome curto |
| `cnpj` | TEXT | Sim | — | CNPJ |
| `segmento` | TEXT | Sim | — | Segmento |
| `telefone_empresa` | TEXT | Sim | — | Telefone |
| `email_empresa` | TEXT | Sim | — | E-mail |
| `endereco` | TEXT | Sim | — | Endereço |
| `nome_responsavel` | TEXT | Não | — | Responsável |
| `email_responsavel` | TEXT | Não | — | E-mail do responsável |
| `telefone_responsavel` | TEXT | Sim | — | Telefone do responsável |
| `plano_solicitado` | TEXT | Sim | — | Plano escolhido |
| `dia_vencimento` | INTEGER | Sim | — | 5, 10, 15, 20 ou 25 |
| `forma_pagamento` | TEXT | Sim | — | `pix`, `transferencia`, etc. |
| `nome_operador` | TEXT | Sim | — | Operador (opcional) |
| `email_operador` | TEXT | Sim | — | E-mail do operador |
| `telefone_operador` | TEXT | Sim | — | Telefone do operador |
| `observacoes` | TEXT | Sim | — | Texto livre |
| `status` | TEXT | Não | `pendente` | `pendente`, `aprovado`, `rejeitado` |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de envio |
| `vendedor_id` | UUID | Sim | — | FK → `usuarios.id` (indicação) |

**RLS:** ativo. Inserção anônima; leitura só admin.

---

### 3.12 empresa_vendedores

Vínculo N:N entre empresas e vendedores.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `gen_random_uuid()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `vendedor_id` | UUID | Não | — | FK → `usuarios.id` |
| `ativo` | BOOLEAN | Sim | `true` | Se o vínculo está ativo |
| `principal` | BOOLEAN | Sim | `false` | Se é o vendedor principal |
| `criado_em` | TIMESTAMPTZ | Sim | `now()` | Data de criação |

**RLS:** ativo.

---

### 3.13 conciliacoes

Pares confirmados na conciliação por arquivo.

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `gen_random_uuid()` | PK |
| `empresa_id` | UUID | Não | — | FK → `empresas.id` |
| `movimentacao_id` | UUID | Não | — | FK → `movimentacoes.id` |
| `data_arquivo` | DATE | Não | — | Data no extrato |
| `descricao_arquivo` | TEXT | Não | — | Descrição no extrato |
| `valor_centavos` | BIGINT | Não | — | Valor no extrato |
| `status` | TEXT | Não | — | `conciliado` ou `rejeitado` |
| `confirmado_por` | TEXT | Sim | — | Nome de quem confirmou |
| `confirmado_em` | TIMESTAMPTZ | Sim | `now()` | Data/hora da confirmação |
| `created_at` | TIMESTAMPTZ | Sim | `now()` | Data de criação (nome inconsistente) |

**RLS:** ativo.

---

### 3.14 solicitacoes_exclusao

Histórico de empresas arquivadas (LGPD).

| Coluna | Tipo | Nulo? | Default | Descrição |
|--------|------|:---:|---------|-----------|
| `id` | UUID | Não | `gen_random_uuid()` | PK |
| `empresa_id` | UUID | Sim | — | UUID (não é FK) |
| `empresa_nome` | TEXT | Sim | — | Nome no arquivamento |
| `usuario_id` | UUID | Sim | — | UUID (não é FK) |
| `usuario_nome` | TEXT | Sim | — | Nome de quem executou |
| `motivo` | TEXT | Sim | — | Motivo declarado |
| `arquivada_em` | TIMESTAMPTZ | Sim | `now()` | Data do arquivamento |
| `expurgo_em` | TIMESTAMPTZ | Não | — | Data prevista para expurgo |
| `status` | TEXT | Não | `arquivada` | `arquivada` ou `expurgada` |
| `observacoes` | TEXT | Sim | — | Campo livre |

> **Nota:** `empresa_id` e `usuario_id` **não são foreign keys** — são
> UUIDs soltos, propositalmente, para preservar o registro mesmo que a
> empresa ou o usuário sejam apagados depois.

**RLS:** ativo.

---

## 4. Categorias de movimentação

Definidas em `src/utils/categorias.js` e validadas no `AppContext`:

| Tipo | Categorias permitidas |
|------|----------------------|
| `receita` | Vendas, Serviços, Maquininha de cartão, Outros ganhos |
| `despesa` | Mercadorias e fornecedores, Contas do negócio, Funcionários, Retirada do dono, Outros gastos |

---

## 5. Estados da empresa

| Status | Significado | Cliente pode logar? | Dados pessoais |
|--------|-------------|:---:|:---:|
| `ativo` | Cliente pagando em dia | ✅ | Mantidos |
| `suspenso` | Venceu, não pagou | ❌ | Mantidos |
| `arquivada` | Excluída pelo admin | ❌ | Anonimizados |

Ver [`docs/ciclo-de-vida.md`](../ciclo-de-vida.md).

---

## 6. Papéis e permissões

### Papel global (`usuarios.role`)

| Papel | O que pode fazer |
|-------|------------------|
| `admin_programa` | Tudo no sistema |
| `dono_programa` | Tudo no sistema (coproprietário) |
| `vendedor` | Cadastrar clientes indicados, ver comissões |
| `dono_cliente` | Gerenciar as próprias empresas (default) |

### Papel por empresa (`user_empresas.papel`)

| Papel | O que pode fazer |
|-------|------------------|
| `dono` | Tudo dentro da empresa |
| `operador` | Lançamentos, extrato, dashboard |
| `leitor` | Só consulta |

---

## 7. Segurança (RLS)

**Todas as 14 tabelas têm RLS ativo.** ✅

---

## 8. Migrações pendentes

⚠️ **Necessário rodar antes de testar o arquivamento:**

```sql
-- Permitir 'arquivada' no CHECK de status_acesso
ALTER TABLE empresas
  DROP CONSTRAINT IF EXISTS empresas_status_acesso_check;

ALTER TABLE empresas
  ADD CONSTRAINT empresas_status_acesso_check
  CHECK (status_acesso = ANY (ARRAY['ativo', 'suspenso', 'arquivada']));
  
  Sem isso, a função arquivarEmpresa falha — o banco rejeita o
valor 'arquivada'.

9. Pendências
□ Rodar a migração SQL acima (obrigatório antes de testar arquivamento)
□ Criar trigger que torna audit_log imutável (LGPD)
□ Criar job de expurgo automático (pg_cron)
□ Padronizar conciliacoes.created_at → criado_em (opcional)
□ Definir índices recomendados (movimentacoes.empresa_id, movimentacoes.data)
□ Confirmar se planos.recursos realmente guarda limite_usuarios

10. Backups
Supabase faz backup diário automático (retenção: 7 dias no plano gratuito).

Recomendado: dump manual mensal para armazenamento externo.

Antes de migrações destrutivas: backup manual obrigatório.

11. Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial com base no schema real	Jeferson
1.1	2026-09-25	Ajuste de campos após visualização do diagrama	Jeferson
2.0	2026-09-25	Reescrita completa com base no schema SQL real	Jeferson
Anexo A — Schema SQL completo

-- Schema completo do MeuGestor (gerado automaticamente pelo Supabase)

CREATE TABLE public.empresas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  status_acesso text NOT NULL DEFAULT 'ativo'
    CHECK (status_acesso = ANY (ARRAY['ativo', 'suspenso'])),
  criado_em timestamptz DEFAULT now(),
  nome_fantasia text,
  vendedor_id uuid,
  arquivada_em timestamptz,
  expurgo_em timestamptz,
  motivo_exclusao text,
  PRIMARY KEY (id),
  FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id)
);

CREATE TABLE public.usuarios (
  id uuid NOT NULL,
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  role text NOT NULL DEFAULT 'dono_cliente'
    CHECK (role = ANY (ARRAY['admin_programa', 'dono_programa', 'vendedor', 'dono_cliente'])),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  comissao_percentual numeric DEFAULT 20.00,
  anonimizado_em timestamptz,
  motivo_exclusao text,
  PRIMARY KEY (id),
  FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.user_empresas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  papel text NOT NULL DEFAULT 'dono'
    CHECK (papel = ANY (ARRAY['dono', 'operador', 'leitor'])),
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);

CREATE TABLE public.movimentacoes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['receita', 'despesa'])),
  categoria text,
  descricao text,
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  data date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status = ANY (ARRAY['pendente', 'pago'])),
  lancado_por text,
  criado_em timestamptz DEFAULT now(),
  retida_ate timestamptz,
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);

CREATE TABLE public.planos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  recursos jsonb DEFAULT '{}'::jsonb,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE public.assinaturas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  plano_id uuid NOT NULL,
  inicio_contrato date NOT NULL DEFAULT CURRENT_DATE,
  fim_contrato date NOT NULL,
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  status text NOT NULL DEFAULT 'ativo'
    CHECK (status = ANY (ARRAY['ativo', 'suspenso', 'cancelado'])),
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (plano_id) REFERENCES public.planos(id)
);

CREATE TABLE public.pagamentos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  mes_referencia date NOT NULL,
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status = ANY (ARRAY['pago', 'pendente', 'atrasado'])),
  data_pagamento date,
  registrado_por uuid,
  observacao text,
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (registrado_por) REFERENCES public.usuarios(id)
);

CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid,
  usuario_id uuid,
  usuario_nome text,
  acao text NOT NULL,
  quando timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE public.contas_bancarias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  banco text NOT NULL,
  agencia text,
  numero_conta text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);

CREATE TABLE public.transacoes_bancarias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  empresa_id uuid NOT NULL,
  conta_id uuid,
  data date NOT NULL,
  descricao text,
  valor_centavos integer NOT NULL,
  conciliado boolean DEFAULT false,
  movimentacao_id uuid,
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (conta_id) REFERENCES public.contas_bancarias(id),
  FOREIGN KEY (movimentacao_id) REFERENCES public.movimentacoes(id)
);

CREATE TABLE public.pedidos_contratacao (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nome_empresa text NOT NULL,
  nome_fantasia text,
  cnpj text,
  segmento text,
  telefone_empresa text,
  email_empresa text,
  endereco text,
  nome_responsavel text NOT NULL,
  email_responsavel text NOT NULL,
  telefone_responsavel text,
  plano_solicitado text,
  dia_vencimento integer,
  forma_pagamento text,
  nome_operador text,
  email_operador text,
  telefone_operador text,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status = ANY (ARRAY['pendente', 'aprovado', 'rejeitado'])),
  criado_em timestamptz DEFAULT now(),
  vendedor_id uuid,
  PRIMARY KEY (id),
  FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id)
);

CREATE TABLE public.empresa_vendedores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  vendedor_id uuid NOT NULL,
  ativo boolean DEFAULT true,
  principal boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (vendedor_id) REFERENCES public.usuarios(id)
);

CREATE TABLE public.conciliacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  movimentacao_id uuid NOT NULL,
  data_arquivo date NOT NULL,
  descricao_arquivo text NOT NULL,
  valor_centavos bigint NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['conciliado', 'rejeitado'])),
  confirmado_por text,
  confirmado_em timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  FOREIGN KEY (movimentacao_id) REFERENCES public.movimentacoes(id)
);

CREATE TABLE public.solicitacoes_exclusao (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid,
  empresa_nome text,
  usuario_id uuid,
  usuario_nome text,
  motivo text,
  arquivada_em timestamptz DEFAULT now(),
  expurgo_em timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'arquivada'
    CHECK (status = ANY (ARRAY['arquivada', 'expurgada'])),
  observacoes text,
  PRIMARY KEY (id)
);

docs(tecnica): reescreve banco de dados com schema SQL real

