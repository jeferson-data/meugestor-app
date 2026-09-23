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