# Regras de Negócio

**Versão:** 1.0
**Data:** 2026-09-25

Este documento centraliza todas as regras de negócio do MeuGestor:
prazos, limites, valores, políticas e comportamentos esperados do
sistema.

Serve como referência única para desenvolvedores, suporte e decisões
futuras. Quando surgir dúvida sobre "como o sistema deve se comportar
em situação X", a resposta está aqui.

---

## 1. Planos e limites

### 1.1 Valores dos planos

| Plano | Valor mensal | Limite de utilizadores |
|-------|-------------|:---:|
| Básico | R$ 49,00 | 1 |
| Padrão | R$ 89,00 | 3 |
| Completo | R$ 149,00 | 999 (ilimitado na prática) |

### 1.2 Recursos por plano

| Recurso | Básico | Padrão | Completo |
|---------|:---:|:---:|:---:|
| Lançamentos | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Extrato | ✅ | ✅ | ✅ |
| Relatórios mensais | ❌ | ✅ | ✅ |
| Conciliação bancária | ❌ | ❌ | ✅ |
| Utilizadores | 1 | 3 | 999 |

### 1.3 Regras de limite de utilizadores

- Em **qualquer plano**, o dono pode cadastrar **1 utilizador** diretamente.
- Utilizadores **adicionais** (além desse 1) são cadastrados pelo
  administrador do MeuGestor, por segurança.
- O limite total depende do plano:
  - Básico: 1 (só o dono — não cabe adicional)
  - Padrão: 3
  - Completo: 999
- Se o dono tentar cadastrar mais do que o plano permite, o botão
  "Novo utilizador" mostra mensagem de erro.

### 1.4 Como funciona a mudança de plano

- Cliente pode mudar de plano a qualquer momento via suporte.
- Mudança é **imediata** (Básico → Padrão ou Padrão → Completo).
- A assinatura atual é cancelada e uma nova com o plano novo é criada
  (via função RPC `alterar_plano_empresa`).
- Diferença de valor no mês corrente é cobrada proporcional.
- Downgrade (Completo → Padrão) só é permitido se o uso atual couber
  no novo plano.

---

## 2. Ciclo de vida da empresa

### 2.1 Estados possíveis

| Estado | Significado | Cliente loga? | Dados pessoais |
|--------|-------------|:---:|:---:|
| `ativo` | Em dia com pagamento | ✅ | Mantidos |
| `suspenso` | Vencido, não pagou | ❌ | Mantidos |
| `arquivada` | Excluído pelo admin | ❌ | Anonimizados |

### 2.2 Transições

| De | Para | Como acontece | Quem faz |
|----|------|---------------|----------|
| (novo) | `ativo` | Admin aprova solicitação | Admin |
| `ativo` | `suspenso` | Vencimento do plano (automático) | Sistema |
| `suspenso` | `ativo` | Pagamento confirmado | Admin |
| `ativo` | `arquivada` | Admin clica na lixeira | Admin |
| `suspenso` | `arquivada` | Admin clica na lixeira | Admin |

### 2.3 Regras de suspensão

- **Quando:** automaticamente quando o vencimento do plano passa.
- **Como:** sistema detecta no login do cliente e bloqueia acesso.
- **Efeito:** cliente vê tela de "Conta suspensa" e não consegue usar
  o sistema.
- **Reversão:** só manual, quando admin confirma o pagamento.

### 2.4 Regras de arquivamento (exclusão)

- **Quem pode fazer:** apenas o admin, pela lixeira na tela Empresas.
- **O que acontece:**
  1. Dados pessoais dos usuários vinculados são **anonimizados**.
  2. Empresa é marcada como `arquivada` (não some do banco).
  3. Assinatura ativa é encerrada.
  4. Pagamentos pendentes são cancelados.
  5. Movimentações recebem `retida_ate = hoje + 5 anos`.
  6. Registro é inserido em `solicitacoes_exclusao`.
  7. Ação é registrada no `audit_log`.
- **Efeito imediato:** empresa some da lista de Empresas, cliente não
  consegue mais logar.
- **Efeito a longo prazo:** após 5 anos, um job de expurgo apaga tudo
  de vez (job ainda não implementado).
- **Irreversível:** sim. Não há como desfazer.

---

## 3. Retenção fiscal

### 3.1 Prazo de retenção

**5 anos** a partir do arquivamento da empresa.

### 3.2 Base legal

- **Código Tributário Nacional (CTN), arts. 173 e 174** — prazo
  decadencial para a Fazenda Pública constituir e cobrar créditos
  tributários.
- **LGPD, art. 16, I** — permite conservação de dados quando houver
  obrigação legal ou regulatória.

### 3.3 O que é retido

| Dado | Retido? | Forma |
|------|:---:|-------|
| Nome do titular | ❌ | Anonimizado imediatamente |
| E-mail do titular | ❌ | Anonimizado imediatamente |
| Telefone do titular | ❌ | Apagado imediatamente |
| Razão social da empresa | ✅ | Mantida |
| CNPJ | ✅ | Mantido |
| Movimentações (valores, datas, categorias) | ✅ | Mantidas |
| Descrições das movimentações | ✅ | Mantidas (podem conter terceiros) |
| Registros de auditoria | ✅ | Mantidos por 5 anos |
| Registros de solicitação de exclusão | ✅ | Mantidos permanentemente |

### 3.4 O que acontece depois de 5 anos

Um job de expurgo (ainda não implementado) apagará:

- A linha da empresa.
- As movimentações com `retida_ate` vencido.
- Os registros de auditoria com mais de 5 anos.

Os registros em `solicitacoes_exclusao` **não são apagados** — servem
como prova permanente de conformidade com a LGPD.

---

## 4. Categorias de movimentação

### 4.1 Lista fechada

As categorias são padronizadas e não podem ser alteradas pelo cliente.
Esta é uma decisão de design para garantir que os gráficos e relatórios
funcionem corretamente.

**Entradas (receita):**

- Vendas
- Serviços
- Maquininha de cartão
- Outros ganhos

**Saídas (despesa):**

- Mercadorias e fornecedores
- Contas do negócio
- Funcionários
- Retirada do dono
- Outros gastos

### 4.2 Regras

- Um lançamento de `receita` só pode usar categorias da lista de entrada.
- Um lançamento de `despesa` só pode usar categorias da lista de saída.
- O sistema valida no cliente **e** sugere no formulário.
- Categorias fora da lista são rejeitadas.

### 4.3 Por que "Retirada do dono" existe

Para separar o que é despesa do negócio do que é retirada pessoal do
dono. Isso é essencial para o pequeno empreendedor de bairro, que
costuma misturar o caixa da empresa com o próprio bolso.

Sem essa categoria, o resultado do mês ficaria distorcido — pareceria
que a empresa gastou mais do que realmente gastou.

---

## 5. Lançamentos

### 5.1 Regras de valor

- Valor sempre positivo (em centavos).
- O sinal (entrada/saída) vem do campo `tipo`.
- Zero não é aceito.
- O banco garante com `CHECK (valor_centavos > 0)`.

### 5.2 Regras de data

- Data padrão é hoje.
- Cliente pode escolher qualquer data passada ou presente.
- **Não é permitido lançar com data futura** (regra de negócio, não
  validada pelo banco — validação no cliente).

### 5.3 Regras de status

- `pendente` — dinheiro ainda não entrou ou saiu.
- `pago` — dinheiro já entrou ou saiu.
- Cliente pode mudar a qualquer momento.
- Alguns relatórios consideram só `pago` (ex.: KPIs do dashboard).

### 5.4 Regras de descrição

- Campo livre, opcional.
- Máximo recomendado: 200 caracteres.
- Pode conter nomes de terceiros (clientes/fornecedores do usuário).
- **Recomendação:** orientar o cliente a usar descrições genéricas
  quando não for essencial mencionar nome.

### 5.5 Regras de lançado_por

- Preenchido automaticamente com o nome do usuário logado.
- Não editável pelo cliente.
- Usado para trilha de auditoria.

---

## 6. Conciliação bancária

### 6.1 Pré-requisito

- Plano Completo.
- Arquivo CSV ou XLSX exportado do banco.

### 6.2 Regras de match

O sistema sugere correspondência entre item do arquivo e movimentação
do sistema usando **três critérios**:

1. **Valor exato** (em centavos, sem tolerância).
2. **Mesma direção** (receita casa com receita, despesa com despesa).
3. **Data dentro de ±1 dia** (tolerância para lançamento D+1 do banco).

### 6.3 Ambiguidade

Se houver **mais de um candidato** com mesmo valor e data, o sistema
**não escolhe sozinho** — força seleção manual.

### 6.4 Confirmação humana

- Toda sugestão precisa ser **confirmada ou rejeitada** pelo usuário.
- Botão "Confirmar todos os sugeridos" acelera o processo, mas o usuário
  ainda está no controle.
- Nunca há match automático sem revisão.

### 6.5 Histórico

- Pares confirmados ficam guardados em `conciliacoes`.
- Um `movimentacao_id` só pode ter um par com `status = 'conciliado'`.
- Rejeições também ficam registradas (histórico de tentativas).

---

## 7. Papéis e permissões

### 7.1 Papéis globais (`usuarios.role`)

| Papel | O que pode fazer |
|-------|------------------|
| `admin_programa` | Tudo no MeuGestor |
| `dono_programa` | Tudo no MeuGestor (coproprietário) |
| `vendedor` | Cadastrar clientes indicados, ver comissões |
| `dono_cliente` | Gerenciar as próprias empresas (padrão) |

### 7.2 Papéis por empresa (`user_empresas.papel`)

| Papel | O que pode fazer |
|-------|------------------|
| `dono` | Tudo dentro da empresa |
| `operador` | Lançamentos, extrato, dashboard |
| `leitor` | Apenas consulta |

### 7.3 Regras

- Um usuário pode ter papéis diferentes em empresas diferentes.
- O papel global é independente do papel por empresa.
- Ao criar um utilizador pelo sistema, o dono só pode escolher entre
  `operador` e `leitor`. Só o admin pode criar `dono`.

---

## 8. Solicitação e aprovação de clientes

### 8.1 Formulário de solicitação

Aberto ao público. Coleta:

**Dados da empresa:** nome, nome fantasia, CNPJ, segmento, telefone,
e-mail, endereço.

**Dados do responsável:** nome completo, e-mail, telefone.

**Dados do operador (opcional):** nome, e-mail, telefone.

**Contratação:** plano escolhido, dia de vencimento (5, 10, 15, 20, 25),
forma de pagamento (PIX ou transferência).

**Observações:** campo livre.

### 8.2 Regras de aprovação

- Toda solicitação **precisa ser aprovada manualmente** pelo admin.
- Não há auto-cadastro.
- Admin pode **aprovar** ou **rejeitar** com motivo.
- Ao aprovar, o sistema:
  - Cria usuário no `auth.users` + `usuarios`.
  - Cria empresa em `empresas`.
  - Cria assinatura em `assinaturas`.
  - Cria pagamento pendente em `pagamentos`.
  - Cria vínculo em `user_empresas`.
- Se o cliente indicou operador, o sistema cria também o usuário do
  operador e o vincula à mesma empresa com papel `operador`.

### 8.3 Regras de rejeição

- Admin deve informar motivo.
- Motivo é registrado em `observacoes`.
- Status vira `rejeitado` (permanece no histórico).

---

## 9. Cobrança e pagamento

### 9.1 Formas de pagamento

- PIX
- Transferência bancária

**Não aceitamos:** cartão de crédito, boleto (por enquanto).

### 9.2 Dia de vencimento

Cliente escolhe no cadastro: **5, 10, 15, 20 ou 25**.

### 9.3 Suspensão por inadimplência

- Vencimento passa → sistema suspende automaticamente.
- Cliente vê tela "Conta suspensa".
- Admin pode reativar após confirmação do pagamento.

### 9.4 Reativação

- Manual, pelo admin.
- Após confirmar o pagamento no extrato bancário, admin clica em "Ativar"
  na tela Empresas.
- Empresa volta para `status_acesso = 'ativo'`.

---

## 10. LGPD

### 10.1 Base legal

| Tratamento | Base legal |
|------------|------------|
| Cadastro de cliente | Execução de contrato |
| Movimentações financeiras | Obrigação legal (fiscal) |
| Trilha de auditoria | Obrigação legal |
| Retenção após exclusão | Obrigação legal (CTN) |

### 10.2 Direitos dos titulares

| Direito | Como o sistema atende | Prazo |
|---------|----------------------|-------|
| Confirmação | Visível no sistema | Imediato |
| Acesso | Exportação em CSV | Imediato |
| Correção | Edição no sistema | Imediato |
| Eliminação | Arquivamento com anonimização | Imediato |
| Portabilidade | Exportação em CSV | Imediato |

### 10.3 Canal do encarregado

- **E-mail:** _[preencher]_
- **Prazo de resposta:** 15 dias corridos (LGPD art. 19)

### 10.4 Dados de terceiros

- Descrições de movimentações podem conter nomes de terceiros.
- Esses terceiros **não são titulares cadastrados** no sistema.
- Responsabilidade pelo uso desses dados é do próprio cliente.
- Documentado na Política de Privacidade.

---

## 11. Prazos e datas

| Prazo | Valor | Base |
|-------|-------|------|
| Retenção de dados financeiros | 5 anos | CTN art. 173 e 174 |
| Resposta a titular LGPD | 15 dias corridos | LGPD art. 19 |
| Comunicação de incidente à ANPD | 3 dias úteis | Recomendação ANPD |
| Validade do link de reset de senha | 60 minutos | Padrão Supabase |
| Ciclo de cobrança | Mensal | — |

---

## 12. Segurança

### 12.1 Autenticação

- E-mail + senha (via Supabase Auth).
- Senhas com hash bcrypt.
- Mínimo 6 caracteres.
- Recuperação por e-mail com link de 60 minutos.

### 12.2 Autorização

- Row Level Security (RLS) ativo em todas as tabelas.
- Usuário só vê dados de empresas às quais está vinculado.
- Admin vê tudo.

### 12.3 Auditoria

- Toda ação crítica gera registro em `audit_log`.
- Registro inclui: quem, o quê, quando, em qual empresa.
- Log deve ser imutável (LGPD) — trigger ainda não implementado.

---

## 13. Regras fora do escopo

As regras abaixo **não existem** no MeuGestor (por decisão de produto):

- ❌ Emissão de nota fiscal.
- ❌ Integração automática com banco.
- ❌ Cobrança recorrente no cartão.
- ❌ Programa de fidelidade ou pontos.
- ❌ Aprovação automática de cadastros.
- ❌ Trial gratuito.
- ❌ Multimoeda.
- ❌ Relatórios contábeis formais.

---

## 14. Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial | Jeferson |