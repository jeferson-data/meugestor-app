# Registro de Aceites de Termos

**Versão:** 1.0
**Data:** 2026-09-23

## O que é

Este documento descreve como o MeuGestor registra o aceite dos Termos
de Uso e da Política de Privacidade pelos titulares, conforme exigido
pela LGPD.

## Por que registrar

O aceite é prova de que o titular foi informado sobre:

- Como o MeuGestor trata seus dados
- Quais são seus direitos
- Quais são as condições do serviço

Em caso de questionamento, o registro comprova que o titular consentiu
ou foi informado.

## Onde o aceite é coletado

### 1. Formulário de solicitação de acesso

O responsável deve marcar um checkbox antes de enviar:

- [ ] Li e aceito os [Termos de Uso](/termos) e a
      [Política de Privacidade](/privacidade)
- [ ] Declaro que tenho autorização do operador (se indicado) para
      fornecer seus dados

### 2. Primeiro acesso ao sistema

Ao entrar pela primeira vez, o usuário deve aceitar novamente:

- [ ] Li e aceito os [Termos de Uso](/termos) e a
      [Política de Privacidade](/privacidade)

Isso garante que quem recebeu as credenciais por e-mail/WhatsApp
também foi informado.

## O que registrar

Para cada aceite, registrar:

| Campo | Descrição |
|-------|-----------|
| `usuario_id` | Quem aceitou |
| `empresa_id` | Empresa vinculada |
| `tipo` | `termos_uso` ou `politica_privacidade` |
| `versao_documento` | Versão do documento aceito (ex.: 1.0) |
| `aceito_em` | Data e hora |
| `ip` | IP de origem (se disponível) |
| `user_agent` | Navegador (se disponível) |

## Onde armazenar

Tabela `aceites_termos` no Supabase:

```sql
CREATE TABLE aceites_termos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('termos_uso', 'politica_privacidade')),
  versao_documento TEXT NOT NULL,
  aceito_em TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  user_agent TEXT
);
Nota: esta tabela ainda precisa ser criada. Marcar como pendente
no inventário.

Quando o titular recusa
Se o titular não aceitar os termos no primeiro acesso:

Bloquear o uso do sistema até aceitar

Oferecer opção de "excluir minha conta" (LGPD art. 18)

Não usar os dados para nenhuma finalidade

Mudança de versão dos documentos
Quando os Termos ou a Política mudarem:

Atualizar a versão do documento (ex.: 1.0 → 1.1)

Notificar os usuários ativos por e-mail

Solicitar novo aceite no próximo login

Registrar o novo aceite com a nova versão

Registros
Data	Usuário	Empresa	Tipo	Versão	Aceito
[data]	[nome]	[empresa]	termos_uso	1.0	✅
[data]	[nome]	[empresa]	politica_privacidade	1.0	✅
text

---

## 7. `docs/lgpd/ciclo-de-vida-dados.md`

```markdown
# Ciclo de Vida dos Dados

**Versão:** 1.0
**Data:** 2026-09-23

Este documento descreve o ciclo de vida de cada dado pessoal no
MeuGestor: quando é criado, por quanto tempo é usado, quando é
arquivado e quando é eliminado.

## Estados de um dado
CRIADO → ATIVO → ARQUIVADO → EXPURGADO
(retido) (eliminado)

text

## Ciclo de vida por categoria

### Dados do responsável (nome, e-mail, telefone)

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Aprovação da solicitação | Cadastro em `usuarios` e `auth.users` |
| **Ativo** | Enquanto a conta estiver ativa | Usado para login e comunicação |
| **Cancelamento** | Cliente clica em "Cancelar conta" | Dados mantidos por 12 meses |
| **Arquivamento** | Exclusão solicitada ou 12 meses após cancelamento | Nome e e-mail anonimizados |
| **Expurgo** | 5 anos após arquivamento | Registro removido de `auth.users` |

### Dados do operador (nome, e-mail, telefone)

Mesmo ciclo do responsável.

### Dados da empresa (razão social, CNPJ, endereço)

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Aprovação da solicitação | Cadastro em `empresas` |
| **Ativo** | Enquanto a conta estiver ativa | Usado para identificação e cobrança |
| **Cancelamento** | Cliente cancela | Mantido por 12 meses |
| **Arquivamento** | Exclusão ou 12 meses | Mantido para fins fiscais |
| **Expurgo** | 5 anos após arquivamento | Removido |

### Movimentações (valor, data, categoria, descrição)

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Lançamento pelo usuário | Registro em `movimentacoes` |
| **Ativo** | Enquanto a conta estiver ativa | Visível ao cliente |
| **Cancelamento** | Cliente cancela | Mantido |
| **Arquivamento** | Exclusão ou 12 meses | Marcado com `retida_ate` |
| **Expurgo** | 5 anos após arquivamento | Removido |

### Logs de auditoria

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Cada ação relevante | Registro em `audit_log` |
| **Ativo** | 5 anos | Consultável pelo admin |
| **Expurgo** | 5 anos | Removido |

### Dados de vendedores

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Cadastro pelo admin | Registro em `vendedores` |
| **Ativo** | Enquanto o vínculo durar | Usado para atribuição de pedidos |
| **Arquivamento** | Fim do vínculo | Mantido |
| **Expurgo** | 5 anos após fim do vínculo | Removido |

### Registro de solicitação de exclusão

| Fase | Quando | O que acontece |
|------|--------|----------------|
| **Criação** | Cliente solicita exclusão | Registro em `solicitacoes_exclusao` |
| **Ativo** | Permanente | Prova de conformidade |
| **Expurgo** | Nunca | Mantido para defesa jurídica |

> **Nota:** o registro da solicitação de exclusão é mantido
> permanentemente como prova de que o MeuGestor cumpriu a LGPD. Ele
> contém apenas IDs (UUIDs) e observações, sem dados pessoais diretos.

## Fluxo de transições automáticas

O MeuGestor deve implementar (via pg_cron) as seguintes transições
automáticas:

| Transição | Prazo | Frequência do job |
|-----------|-------|-------------------|
| Empresa cancelada → arquivada | 12 meses após cancelamento | Diária |
| Empresa arquivada → expurgada | 5 anos após arquivamento | Diária |
| Movimentações → expurgadas | 5 anos após arquivamento | Diária |
| Logs de auditoria → expurgados | 5 anos após criação | Diária |

**Status:** ⚠️ não implementado ainda.

## Backup e retenção

- **Backup do Supabase:** diário, retido por 7 dias (plano padrão)
- **Backup manual:** recomendado exportar mensalmente para armazenamento externo
- **Backup de dados expurgados:** não é feito (expurgo é definitivo)

## Revisão

Este documento deve ser revisado sempre que:

- Um novo dado pessoal for coletado
- Um novo prazo legal for identificado
- Uma nova tabela for criada

**Última revisão:** 2026-09-23