# Base Legal dos Tratamentos

**Versão:** 1.0
**Data:** 2026-09-23

## O que é base legal

Toda operação com dados pessoais precisa de uma **base legal** prevista
no art. 7º da LGPD. Sem base legal, o tratamento é ilegal.

O MeuGestor usa **três bases legais**:

| Base legal | Quando usamos |
|------------|---------------|
| **Execução de contrato** (art. 7º, V) | Tratamentos necessários para entregar o serviço ao cliente |
| **Obrigação legal** (art. 7º, II) | Tratamentos exigidos por lei (fiscal, tributária) |
| **Consentimento** (art. 7º, I) | Tratamentos que não cabem nas outras bases |

> **Não usamos** legítimo interesse, proteção da vida, tutela da saúde,
> estudos por órgão de pesquisa nem proteção ao crédito.

## Base legal por tratamento

| Dado / Tratamento | Base legal | Justificativa |
|-------------------|------------|---------------|
| Cadastro do responsável (nome, e-mail, telefone) | Execução de contrato | Necessário para criar a conta e prestar o serviço |
| Cadastro do operador (nome, e-mail, telefone) | Execução de contrato | Solicitado pelo responsável para operar o sistema |
| Cadastro de vendedor (nome, e-mail, telefone) | Execução de contrato de trabalho/parceria | Relação comercial do MeuGestor com o representante |
| Dados da empresa (razão social, nome fantasia, CNPJ, endereço) | Execução de contrato | Identificação do contratante |
| Telefone e e-mail da empresa | Execução de contrato | Comunicação operacional |
| Segmento da empresa | Execução de contrato | Personalização da experiência |
| Plano, dia de vencimento e forma de pagamento | Execução de contrato | Cobrança |
| Movimentações (valor, data, categoria, descrição) | Obrigação legal | Registro contábil (CTN art. 173 e 174) |
| `lancado_por` (nome de quem lançou) | Execução de contrato | Auditoria de acesso |
| Registro de acesso (logs, auditoria) | Obrigação legal | Segurança e rastreabilidade |
| Uso de cookies estritamente necessários | Execução de contrato | Funcionamento do app |
| Envio de e-mail transacional | Execução de contrato | Comunicação sobre a conta |
| Envio de e-mail de aprovação ao operador | Execução de contrato | Transparência com o titular |
| Retenção de dados financeiros após exclusão | Obrigação legal | CTN art. 173 e 174 |
| Anonimização ao excluir conta | Obrigação legal | LGPD art. 16 |

## Dados que NÃO tratamos (e não precisam de base legal)

- CPF / RG
- Data de nascimento
- Dados bancários completos
- Cartão de crédito
- Dados sensíveis (art. 5º, II)
- Geolocalização
- Biometria
- Histórico de navegação fora do app

## Consentimento — quando usamos

Não usamos consentimento para os tratamentos principais, porque eles se
baseiam em execução de contrato ou obrigação legal. O consentimento
só seria necessário para finalidades extras, como:

- Envio de newsletter (não implementado)
- Compartilhamento com terceiros para marketing (não fazemos)

Se algum dia implementarmos qualquer uma dessas finalidades, será
necessário um opt-in explícito e registrado.

## Revisão

Esta tabela deve ser atualizada sempre que:

- Um novo dado pessoal for coletado
- Um novo operador (Supabase, Vercel, etc.) for adicionado
- Uma nova finalidade de tratamento for criada

**Última revisão:** 2026-09-23