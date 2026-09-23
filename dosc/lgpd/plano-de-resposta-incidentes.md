# Plano de Resposta a Incidentes de Segurança

**Versão:** 1.0
**Data:** 2026-09-23

Este documento define o que fazer em caso de vazamento, acesso indevido
ou qualquer incidente envolvendo dados pessoais no MeuGestor.

## O que é incidente de segurança

Qualquer evento que comprometa:

- Confidencialidade dos dados (acesso não autorizado)
- Integridade dos dados (alteração indevida)
- Disponibilidade dos dados (indisponibilidade prolongada)
- Autenticidade (falsificação de identidade)

Exemplos:

- Vazamento de credenciais do Supabase
- Acesso indevido a dados de outra empresa
- Exposição de banco de dados sem RLS
- Phishing que resultou em acesso a contas
- Perda de backup
- Ataque de ransomware

## Classificação do incidente

| Nível | Descrição | Exemplo |
|-------|-----------|---------|
| **Baixo** | Sem risco relevante para titulares | Tentativa de login falhada |
| **Médio** | Risco limitado, poucos titulares afetados | Um usuário conseguiu ver dado de outro por bug |
| **Alto** | Risco relevante, muitos titulares afetados | Vazamento do banco de dados |
| **Crítico** | Risco grave, dados sensíveis ou financeiros expostos | Banco de dados público + chaves de API expostas |

## Fluxo de resposta

### 1. Detecção e contenção (0 a 2 horas)

- Identificar o incidente
- **Conter imediatamente:**
  - Se for credencial vazada → rotacionar chaves
  - Se for bug → desabilitar a funcionalidade afetada
  - Se for ataque → bloquear origem
- Registrar tudo: horário, o que aconteceu, o que foi feito

### 2. Avaliação (2 a 24 horas)

- Determinar:
  - Quantos titulares foram afetados
  - Quais dados foram expostos
  - Se há risco relevante (dano moral, financeiro, discriminação)
- Classificar o incidente (baixo, médio, alto, crítico)

### 3. Comunicação

**Se o incidente for de nível alto ou crítico:**

- **ANPD:** comunicar em até 3 dias úteis
  - Canal: https://www.gov.br/anpd/
  - Informar: natureza do incidente, dados afetados, medidas tomadas

- **Titulares afetados:** comunicar em prazo razoável
  - Por e-mail
  - Informar: quais dados foram expostos, riscos, o que fazer

**Se o incidente for de nível baixo ou médio:**

- Registrar internamente
- Não é obrigatório comunicar ANPD nem titulares
- Avaliar caso a caso

### 4. Remediação (24 horas a 30 dias)

- Corrigir a causa raiz
- Implementar medida preventiva
- Testar a correção
- Documentar tudo

### 5. Pós-incidente (30 dias)

- Revisar o inventário de dados
- Revisar o plano de resposta
- Treinar a equipe (se houver)
- Atualizar medidas de segurança

## Modelo de comunicação à ANPD
À Autoridade Nacional de Proteção de Dados

Assunto: Comunicação de Incidente de Segurança

Identificação do controlador

Nome: MeuGestor

Encarregado: Jeferson

Contato: [e-mail]

Descrição do incidente

Data e hora: [data/hora]

Tipo: [vazamento / acesso indevido / ...]

Causa: [descrição]

Dados afetados

Categorias: [nome, e-mail, telefone, ...]

Número de titulares: [número]

Período: [início e fim]

Riscos identificados
[descrever riscos]

Medidas tomadas
[descrever medidas de contenção, correção e prevenção]

Comunicação aos titulares
[informar se foi feita e como]

Atenciosamente,
Jeferson
Encarregado de Dados — MeuGestor

text

## Modelo de comunicação aos titulares
Assunto: Comunicado importante sobre seus dados

Olá, [NOME]!

Identificamos um incidente de segurança que pode ter afetado alguns
dos seus dados cadastrados no MeuGestor.

O que aconteceu: [descrição simples e direta]

Quais dados foram afetados: [listar]

O que já fizemos: [medidas de contenção e correção]

O que recomendamos que você faça: [ação, se aplicável]

Estamos à disposição para esclarecer qualquer dúvida por este e-mail.

Equipe MeuGestor

text

## Contatos de emergência

| Contato | Quando acionar |
|---------|----------------|
| Encarregado (Jeferson) | Primeiro a saber |
| Advogado LGPD | Incidente alto ou crítico |
| ANPD | Incidente alto ou crítico |
| Supabase Support | Se o incidente envolver a plataforma |
| Vercel Support | Se o incidente envolver a hospedagem |

## Histórico de incidentes

| Data | Nível | Descrição | Medidas tomadas |
|------|-------|-----------|-----------------|
| — | — | Nenhum incidente registrado | — |
