# Inventário de Dados Pessoais (PII Map)

**Versão:** 2.0
**Data:** _[preencher]_
**Responsável (controlador):** _[seu nome]_
**Base legal principal:** LGPD — Lei nº 13.709/2018

## Objetivo

Este documento mapeia todos os dados pessoais tratados pelo MeuGestor,
identificando onde estão armazenados, por que são coletados, por quanto
tempo são guardados e com quem são compartilhados.

## Definições

- **Dado pessoal**: informação relacionada a pessoa natural identificada
  ou identificável.
- **Dado pessoal sensível**: origem racial, convicção religiosa, dado de
  saúde, biometria, etc. — **o MeuGestor não trata dados sensíveis**.
- **Titular**: pessoa natural a quem os dados se referem.
- **Controlador**: quem decide sobre o tratamento — **MeuGestor**.
- **Operador**: quem trata em nome do controlador — **Supabase, Vercel,
  provedor de e-mail**.

## 1. Categorias de titulares

O MeuGestor trata dados de **quatro categorias** de titulares:

| Categoria | Quem são | Como entram no sistema |
|-----------|----------|------------------------|
| **Responsável** | Pessoa física que contrata o MeuGestor em nome da empresa | Formulário de solicitação |
| **Operador** | Pessoa indicada pelo responsável para lançar movimentações | Formulário de solicitação (opcional) |
| **Terceiros mencionados** | Clientes/fornecedores da empresa cliente, citados em descrições de movimentações | Texto livre nas movimentações |
| **Funcionários do cliente** *(a confirmar)* | Pessoas cadastradas pelo admin a pedido do cliente | Cadastro interno |

## 2. Inventário por tabela

### Tabela `empresas`

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `id` | Não (UUID) | — | Identificador | — | Enquanto a conta existir |
| `razao_social` | ⚠️ Pode ser | Nome (se MEI) | Identificação fiscal | Obrigação legal | 5 anos após exclusão |
| `nome_fantasia` | ⚠️ Pode ser | Nome comercial | Identificação | Execução de contrato | 5 anos após exclusão |
| `cnpj` | ⚠️ Pode ser | Dado cadastral | Identificação fiscal | Obrigação legal | 5 anos após exclusão |
| `segmento` | Não | — | Personalização | Execução de contrato | Enquanto a conta existir |
| `telefone` | ✅ Sim | Contato | Comunicação | Execução de contrato | 5 anos após exclusão |
| `email` | ✅ Sim | Contato | Comunicação | Execução de contrato | 5 anos após exclusão |
| `endereco_completo` | ✅ Sim | Localização | Identificação do negócio | Execução de contrato | 5 anos após exclusão |
| `plano` | Não | — | Controle comercial | Execução de contrato | Enquanto a conta existir |
| `dia_vencimento` | Não | — | Cobrança | Execução de contrato | Enquanto a conta existir |
| `forma_pagamento` | Não (PIX/transferência) | — | Cobrança | Execução de contrato | Enquanto a conta existir |
| `status_acesso` | Não | — | Controle de acesso | — | Permanente |
| `cancelada_em`, `excluida_em`, `expurgo_em` | Não | — | Registro histórico | Obrigação legal | Permanente |

> **Nota:** `razao_social`, `nome_fantasia` e `cnpj` são PII quando a
> empresa é **MEI** ou **empresa individual**, pois coincidem com o nome
> do titular. Para LTDA/SA, o nome empresarial não é PII, mas o CNPJ
> pode ser associado ao representante legal.

### Tabela `usuarios`

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `id` | Não (UUID) | — | Identificador | — | Enquanto a conta existir |
| `nome` | ✅ Sim | Nome | Identificação e auditoria | Execução de contrato | 5 anos após exclusão |
| `email` | ✅ Sim | Contato | Login | Execução de contrato | 5 anos após exclusão |
| `telefone` | ✅ Sim | Contato | Comunicação | Execução de contrato | 5 anos após exclusão |
| `role` | Não | — | Controle de acesso | — | Enquanto a conta existir |
| `anonimizado_em` | Não | — | Registro de exclusão | Obrigação legal | Permanente |
| `motivo_exclusao` | Não | — | Registro de exclusão | Obrigação legal | Permanente |

> **Nota:** a tabela `usuarios` conterá **tanto o responsável quanto o
> operador**, quando ambos forem cadastrados. Cada um é um titular
> independente, com seus próprios direitos.

### Tabela `movimentacoes`

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `id` | Não (UUID) | — | Identificador | — | 5 anos (fiscal) |
| `descricao` | ⚠️ Pode conter | Terceiros mencionados | Registro contábil | Obrigação legal | 5 anos (fiscal) |
| `valor_centavos` | Não | — | Registro contábil | Obrigação legal | 5 anos (fiscal) |
| `data` | Não | — | Registro contábil | Obrigação legal | 5 anos (fiscal) |
| `categoria` | Não | — | Classificação contábil | Obrigação legal | 5 anos (fiscal) |
| `lancado_por` | ✅ Sim | Nome do usuário | Auditoria | Execução de contrato | 5 anos (fiscal) |
| `retida_ate` | Não | — | Controle de expurgo | Obrigação legal | Permanente |

> ⚠️ **Atenção:** `descricao` pode conter nome de terceiros
> (ex.: "Venda para Maria"). Esses terceiros **não são titulares
> cadastrados**, mas seus nomes são dados pessoais.
> Recomendações:
> 1. Orientar o cliente a usar descrições genéricas ("Venda — cliente X")
> 2. Incluir isso na Política de Privacidade
> 3. Ao excluir conta, `descricao` fica retido por obrigação fiscal
>    e isso deve ser comunicado ao titular

### Tabela `vendedores` *(cadastrados pelo admin)*

⚠️ **A confirmar:** preciso saber se estes vendedores são:
- (a) Funcionários do cliente → o dado é tratado em nome do cliente
- (b) Representantes do MeuGestor → o dado é do próprio MeuGestor

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `nome` | ✅ Sim | Nome | Identificação | _[a definir]_ | _[a definir]_ |
| `email` | ✅ Sim | Contato | Comunicação | _[a definir]_ | _[a definir]_ |
| `telefone` | ✅ Sim | Contato | Comunicação | _[a definir]_ | _[a definir]_ |

### Tabela `pedidos` *(se houver)*

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `cliente_nome` | ⚠️ Pode conter | Terceiros mencionados | Registro comercial | Execução de contrato | 5 anos |
| `cliente_contato` | ⚠️ Pode conter | Contato | Registro comercial | Execução de contrato | 5 anos |

### Tabela `audit_log`

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `usuario_nome` | ✅ Sim | Nome | Auditoria | Obrigação legal | 5 anos |
| `acao` | ⚠️ Pode conter | Descrição | Auditoria | Obrigação legal | 5 anos |
| `quando` | Não | — | Auditoria | Obrigação legal | 5 anos |

### Tabela `solicitacoes_exclusao`

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `empresa_id` | Não (UUID) | — | Registro | Obrigação legal | Permanente |
| `usuario_id` | Não (UUID) | — | Registro | Obrigação legal | Permanente |
| `observacoes` | ⚠️ Pode conter | Texto livre | Registro | Obrigação legal | Permanente |

### Tabela `conciliacoes` *(se implementada)*

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `descricao_arquivo` | ⚠️ Pode conter | Terceiros mencionados | Conciliação | Execução de contrato | 5 anos |
| `confirmado_por` | ✅ Sim | Nome | Auditoria | Execução de contrato | 5 anos |

### Supabase Auth (`auth.users`)

| Campo | Dado pessoal? | Categoria | Finalidade | Base legal | Retenção |
|-------|:---:|-----------|------------|------------|----------|
| `email` | ✅ Sim | Contato | Login | Execução de contrato | Enquanto a conta existir |
| `encrypted_password` | Não (hash) | — | Segurança | Execução de contrato | Enquanto a conta existir |
| `last_sign_in_at` | Não | — | Auditoria | Execução de contrato | Enquanto a conta existir |

## 3. Dados que NÃO são coletados

O MeuGestor **não coleta**:

- ❌ CPF ou RG do titular
- ❌ Data de nascimento
- ❌ Dados bancários do titular (só comprovantes de PIX/transferência, sem armazenar conta)
- ❌ Dados de cartão de crédito (forma de pagamento excluída por decisão)
- ❌ Dados sensíveis (saúde, biometria, religião, etc.)
- ❌ Geolocalização em tempo real
- ❌ Cookies de rastreamento de terceiros
- ❌ Histórico de navegação fora da aplicação

## 4. Compartilhamento com terceiros

| Terceiro | Categoria | Dados compartilhados | Finalidade | Base legal |
|----------|-----------|----------------------|------------|------------|
| **Supabase** | Operador | Todos os dados | Hospedagem | Execução de contrato |
| **Vercel** | Operador | Logs de acesso, IP | Hospedagem | Execução de contrato |
| **Provedor de e-mail** *(futuro)* | Operador | Nome, e-mail | E-mails transacionais | Execução de contrato |
| **Contador do MeuGestor** *(se houver)* | Terceiro | Notas fiscais de contratação | Obrigação fiscal | Obrigação legal |

> ⚠️ **Nenhum dado é vendido ou compartilhado para fins de marketing.**

## 5. Direitos dos titulares

| Direito (LGPD art. 18) | Como o MeuGestor atende | Prazo |
|------------------------|-------------------------|-------|
| **Confirmação de tratamento** | Cliente vê seus dados no sistema | Imediato |
| **Acesso aos dados** | Exportação em CSV pelo próprio sistema | Imediato |
| **Correção** | Cliente edita no sistema | Imediato |
| **Anonimização / bloqueio** | Anonimização ao excluir conta | Imediato |
| **Eliminação** | Fluxo de exclusão com retenção fiscal | Imediato |
| **Portabilidade** | Exportação em CSV | Imediato |
| **Informação sobre compartilhamento** | Política de Privacidade | — |
| **Revogação de consentimento** | Cancelamento da conta | Imediato |

> **Canal para o titular:** _[preencher: privacidade@meugestor.com ou equivalente]_
> **Prazo de resposta:** até 15 dias corridos (LGPD art. 19)

## 6. Prazos de retenção

| Categoria de dado | Prazo | Base legal |
|-------------------|-------|------------|
| Dados pessoais enquanto conta ativa | Enquanto durar o contrato | Execução de contrato |
| Dados pessoais após cancelamento | 12 meses (para reativação) | Decisão operacional |
| Dados financeiros após exclusão | 5 anos | CTN art. 173 e 174 |
| Registro da solicitação de exclusão | Permanente | Prova de conformidade |
| Logs de auditoria | 5 anos | Obrigação legal |
| Comprovantes de pagamento | 5 anos | Obrigação fiscal |

## 7. Medidas de segurança implementadas

| Medida | Onde | Status |
|--------|------|:---:|
| HTTPS em todas as requisições | Vercel | ✅ |
| Row Level Security (RLS) | Supabase | ⚠️ verificar todas as tabelas |
| Autenticação por e-mail e senha | Supabase Auth | ✅ |
| Senhas com hash bcrypt | Supabase Auth | ✅ |
| Trilha de auditoria | Tabela `audit_log` | ✅ |
| Anonimização ao excluir | Tabela `usuarios` | ⚠️ implementar |
| Exportação de dados pelo titular | `exportarDados.js` | ⚠️ implementar |
| Imutabilidade do `audit_log` | Trigger SQL | ⚠️ implementar |
| Aceite de termos no cadastro | Tela de cadastro | ⚠️ implementar |
| Aviso de retenção fiscal na exclusão | Tela de exclusão | ⚠️ implementar |

## 8. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:---:|:---:|-----------|
| Vazamento de credenciais do Supabase | Baixa | Alto | Nunca versionar `.env.local`; rotação de chaves |
| Acesso indevido entre empresas | Baixa | Alto | RLS bem configurado |
| `descricao` com nome de terceiros | Alta | Médio | Orientar uso genérico + documentar |
| Endereço completo exposto em vazamento | Média | Alto | RLS + acesso restrito ao próprio titular |
| Exclusão sem anonimização | Média | Alto | Implementar fluxo de exclusão |
| Ausência de registro de aceite dos termos | Alta | Alto | Implementar checkbox com log |
| Cliente não avisado sobre retenção fiscal | Média | Médio | Tela de confirmação na exclusão |
| Operador cadastrado sem consentimento próprio | Média | Médio | Incluir operador no e-mail de boas-vindas |
| Dados em backup sem política | Média | Médio | Documentar backups do Supabase |

## 9. Próximas ações

- [ ] Confirmar se vendedores são funcionários do cliente ou representantes do MeuGestor
- [ ] Rodar migração SQL de anonimização
- [ ] Criar canal do encarregado (e-mail dedicado)
- [ ] Escrever Política de Privacidade
- [ ] Escrever Termos de Uso
- [ ] Implementar checkbox de aceite no cadastro
- [ ] Ativar RLS em todas as tabelas
- [ ] Tornar `audit_log` imutável
- [ ] Configurar job de pg_cron
- [ ] Definir política de backup
- [ ] Incluir aviso sobre dados de terceiros na Política de Privacidade

## 10. Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | _[preencher]_ | Criação inicial | _[seu nome]_ |
| 2.0 | _[preencher]_ | Inclusão de endereço, operador e vendedores | _[seu nome]_ |