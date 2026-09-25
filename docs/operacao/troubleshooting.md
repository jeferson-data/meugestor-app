# Troubleshooting

**Versão:** 1.0
**Data:** 2026-09-25

Este documento reúne os problemas mais comuns que podem acontecer no
MeuGestor, com o passo a passo para investigar e resolver.

Serve como guia rápido para o administrador. Cada situação tem:
- **Sintoma:** o que o cliente relata
- **Diagnóstico:** como confirmar o problema
- **Solução:** o que fazer
- **Prevenção:** como evitar que aconteça de novo

---

## Índice

### Problemas de acesso
1. [Cliente não consegue fazer login](#1-cliente-não-consegue-fazer-login)
2. [Cliente esqueceu a senha e não recebe o e-mail](#2-cliente-esqueceu-a-senha-e-não-recebe-o-e-mail)
3. [Cliente perdeu a senha provisória](#3-cliente-perdeu-a-senha-provisória)
4. [Cliente vê "conta suspensa"](#4-cliente-vê-conta-suspensa)

### Problemas de operação
5. [Lançamento não aparece no extrato](#5-lançamento-não-aparece-no-extrato)
6. [Valor do lançamento aparece errado](#6-valor-do-lançamento-aparece-errado)
7. [Categoria não aparece na lista](#7-categoria-não-aparece-na-lista)
8. [Gráfico não carrega ou aparece vazio](#8-gráfico-não-carrega-ou-aparece-vazio)

### Problemas de conciliação
9. [Arquivo do banco não é aceito](#9-arquivo-do-banco-não-é-aceito)
10. [Conciliação não encontra pares](#10-conciliação-não-encontra-pares)
11. [Conciliação sugere par errado](#11-conciliação-sugere-par-errado)

### Problemas de LGPD
12. [Cliente pede exportação de dados](#12-cliente-pede-exportação-de-dados)
13. [Cliente pede exclusão de conta](#13-cliente-pede-exclusão-de-conta)
14. [Cliente quer mudar dados pessoais](#14-cliente-quer-mudar-dados-pessoais)

### Problemas administrativos
15. [Empresa não aparece na lista](#15-empresa-não-aparece-na-lista)
16. [Não consigo criar utilizador](#16-não-consigo-criar-utilizador)
17. [Não consigo aprovar um cadastro](#17-não-consigo-aprovar-um-cadastro)

---

## 1. Cliente não consegue fazer login

**Sintoma:** Cliente relata que digitou e-mail e senha corretos, mas o
sistema não deixa entrar.

**Diagnóstico:**

1. Confirme que o e-mail está correto (sem espaços, sem letras trocadas).
2. No Supabase → **Authentication → Users**, busque pelo e-mail.
3. Verifique:
   - Se o usuário **existe** em `auth.users`.
   - Se está com `email_confirmed_at` preenchido.
   - Se está com `banned_until` definido (bloqueado).
4. Na tabela `usuarios`, verifique:
   - Se `ativo = true`.
   - Se o `role` está correto.
5. Na tabela `empresas`, verifique `status_acesso`:
   - `ativo` → deve deixar logar.
   - `suspenso` → cliente vê tela de suspensão (ver item 4).
   - `arquivada` → empresa foi excluída (não deveria estar logando).

**Solução:**

| Causa | Solução |
|-------|---------|
| Senha errada | Orientar usar "Esqueci minha senha" |
| E-mail não confirmado | No painel do Supabase, marcar como confirmado manualmente |
| Usuário banido | Remover `banned_until` no Supabase |
| `ativo = false` | Atualizar para `true` na tabela `usuarios` |
| Empresa suspensa | Reativar após confirmação de pagamento |
| Empresa arquivada | Não reativar — foi excluída permanentemente |

**Prevenção:** nenhuma. Login falha por motivos variados.

---

## 2. Cliente esqueceu a senha e não recebe o e-mail

**Sintoma:** Cliente usa "Esqueci minha senha" mas não recebe o e-mail.

**Diagnóstico:**

1. Confirme que o e-mail está cadastrado (ver item 1).
2. Peça para verificar a caixa de spam.
3. Confirme no painel do Supabase se o e-mail foi enviado:
   - **Authentication → Logs** mostra tentativas de reset.
4. Verifique se o limite de envios foi atingido:
   - Supabase gratuito: **2 e-mails por hora**.
   - Se o cliente pediu 3 vezes em 5 minutos, os 2 últimos foram bloqueados.

**Solução:**

| Causa | Solução |
|-------|---------|
| E-mail caiu no spam | Orientar verificar spam |
| Limite de 2/h atingido | Esperar 1 hora ou resetar senha manualmente |
| E-mail não cadastrado | Confirmar o e-mail correto |
| Problema no SMTP | Usar resetar senha manual (ver abaixo) |

**Resetar senha manualmente (quando o cliente não recebe):**

1. Vá em **Utilizadores** na empresa do cliente.
2. Clique no ícone de chave (🔑) ao lado do nome.
3. Digite uma nova senha provisória.
4. Copie e envie por WhatsApp/e-mail.
5. Oriente trocar no primeiro login.

**Prevenção:** configurar SMTP próprio (Resend, Brevo, SendGrid) para
remover o limite de 2/h e melhorar a entregabilidade.

---

## 3. Cliente perdeu a senha provisória

**Sintoma:** Cliente recebeu credenciais, mas perdeu a senha antes de
fazer o primeiro login.

**Diagnóstico:** simples — não tem como recuperar a senha antiga
(ela não é armazenada em texto puro).

**Solução:**

1. Vá em **Utilizadores** na empresa do cliente.
2. Clique no ícone de chave (🔑) ao lado do nome.
3. Digite uma nova senha provisória.
4. Envie para o cliente por WhatsApp/e-mail.
5. Oriente trocar no primeiro login.

Alternativa: orientar o cliente a usar "Esqueci minha senha" no login.

**Prevenção:** ao enviar credenciais, orientar o cliente a guardar a
senha em local seguro (gerenciador de senhas, bloco de notas protegido).

---

## 4. Cliente vê "conta suspensa"

**Sintoma:** Cliente relata que aparece a tela de "Conta suspensa" ao
tentar entrar.

**Diagnóstico:**

1. Vá em **Empresas** e localize a empresa do cliente.
2. Verifique o `status_acesso`:
   - `suspenso` → cliente não pagou ou o vencimento passou.
   - `arquivada` → empresa foi excluída (não deveria ver tela de
     suspensão, ver item 13).
3. Verifique os pagamentos em **Pagamentos**:
   - Última mensalidade está paga?
   - Data de vencimento?

**Solução:**

| Causa | Solução |
|-------|---------|
| Cliente não pagou | Enviar cobrança amigável e aguardar |
| Cliente pagou mas sistema não liberou | Confirmar pagamento e clicar em "Ativar" na tela Empresas |
| Erro no vencimento | Ajustar data em `assinaturas.fim_contrato` |

**Liberar acesso manualmente:**

1. Vá em **Empresas**.
2. Localize a empresa.
3. Clique em **Ativar**.
4. Confirme.

**Prevenção:** manter controle rigoroso das datas de vencimento. Se
possível, criar rotina semanal de revisão de pagamentos pendentes.

---

## 5. Lançamento não aparece no extrato

**Sintoma:** Cliente fez um lançamento, mas não encontra no extrato.

**Diagnóstico:**

1. Confirme em qual empresa o lançamento foi feito.
2. Verifique se a empresa ativa no momento do login é a mesma.
3. No Supabase, consulte a tabela `movimentacoes`:
   ```sql
   SELECT * FROM movimentacoes
   WHERE empresa_id = 'UUID_DA_EMPRESA'
     AND descricao ILIKE '%palavra-chave%'
   ORDER BY criado_em DESC;
Verifique se o filtro do extrato está ocultando o lançamento
(data, tipo, status).

Solução:

Causa	Solução
Filtro de data	Ajustar filtro para incluir o período
Filtro de tipo	Verificar se está vendo só entradas ou só saídas
Empresa ativa errada	Trocar para a empresa correta
Lançamento em outra conta	Confirmar qual usuário lançou
Prevenção: orientar o cliente a conferir o filtro antes de achar
que "sumiu".

6. Valor do lançamento aparece errado
Sintoma: Cliente reclama que o valor está diferente do que digitou.

Diagnóstico:

Confirme o valor real no Supabase:

sql
SELECT id, descricao, valor_centavos, criado_em
FROM movimentacoes
WHERE id = 'UUID_DO_LANCAMENTO';
Compare com o que o cliente relata.

Verifique se houve edição posterior:

sql
SELECT * FROM audit_log
WHERE acao ILIKE '%Atualizou movimentação%'
  AND empresa_id = 'UUID_DA_EMPRESA'
ORDER BY quando DESC;
Causas comuns:

Causa	Exemplo
Erro de digitação	Cliente digitou 5000,00 quando queria 50,00
Confusão de centavos	valor_centavos = 5000 = R$ 50,00
Edição posterior	Alguém editou o lançamento
Vírgula vs ponto	Sistema espera ponto, cliente digitou vírgula
Solução:

Orientar cliente a editar no extrato.

Se necessário, corrigir diretamente no Supabase.

Registrar a correção no audit_log.

Prevenção: revisar o campo de valor com máscara clara.

7. Categoria não aparece na lista
Sintoma: Cliente reclama que a categoria que quer não está na lista.

Diagnóstico: as categorias são fechadas por design. Não há como
adicionar categorias personalizadas.

Solução: orientar o cliente a usar a categoria mais próxima:

Se o cliente quer lançar...	Orientar usar
Ração para animal de estimação da loja	Outros gastos
Café da manhã para reunião	Contas do negócio
Doação	Outros gastos
Adiantamento de salário	Funcionários
Por que não permitir categorias personalizadas:

Gráficos e relatórios dependem de categorias padronizadas.

Categorias soltas quebram o dashboard.

Se um dia virar necessidade real, criar "Outros (personalizado)".

Prevenção: a lista já cobre 95% dos casos. Se um cliente reclamar
muito, anotar como feedback para revisão futura.

8. Gráfico não carrega ou aparece vazio
Sintoma: Cliente reclama que o gráfico do dashboard está em branco
ou não aparece.

Diagnóstico:

Confirme se há lançamentos no período selecionado.

Verifique no console do navegador (F12 → Console) se há erros.

Confirme o status dos lançamentos:

KPIs do dashboard consideram só pago.

Gráficos consideram pago e pendente.

Solução:

Causa	Solução
Sem lançamentos no período	Ajustar período (7, 15, 30, 90 dias)
Só lançamentos pendentes	Marcar como pagos ou aceitar que não aparecem nos KPIs
Erro no JavaScript	Reportar ao desenvolvedor com print do console
Navegador antigo	Pedir para atualizar ou usar Chrome/Edge
Prevenção: orientar o cliente a manter o navegador atualizado.

9. Arquivo do banco não é aceito
Sintoma: Cliente tenta importar CSV/XLSX e o sistema rejeita.

Diagnóstico:

Confirme o formato:

✅ .csv

✅ .xlsx, .xls

❌ .ofx (não suportado)

❌ .pdf (não suportado)

❌ .txt (não suportado)

Confirme o tamanho do arquivo (limite: ~5 MB).

Confirme que tem colunas legíveis (data, descrição, valor).

Solução:

Causa	Solução
Formato errado	Pedir para exportar como CSV ou XLSX
Arquivo corrompido	Pedir para reexportar
Arquivo muito grande	Pedir para dividir por período
Encoding estranho	Pedir para exportar como UTF-8
Como orientar o cliente a exportar:

Itaú: Menu → Conta → Extrato → Exportar → CSV

Bradesco: Extrato → Exportar → CSV

Nubank: Extrato → Compartilhar → CSV

Inter: Extrato → Exportar → CSV

Caixa: Extrato → Exportar → CSV

Prevenção: documentar os formatos aceitos na tela de conciliação.

10. Conciliação não encontra pares
Sintoma: Cliente importa o arquivo, mas o sistema não sugere
nenhuma correspondência.

Diagnóstico:

Confirme se os lançamentos do período foram feitos no sistema.

Compare:

Datas (o banco pode lançar D+1).

Valores (o banco pode agrupar transações).

Direção (entrada ↔ entrada, saída ↔ saída).

Verifique se o cliente confundiu "receita" com "despesa" nos
lançamentos.

Solução:

Causa	Solução
Lançamentos não feitos	Orientar a fazer primeiro, depois conciliar
Data D+1	Tolerância já é de ±1 dia, verificar se passa disso
Valor agrupado	Orientar a lançar separado
Direção trocada	Corrigir o lançamento
Prevenção: orientar o cliente a lançar movimentações antes de
conciliar.

11. Conciliação sugere par errado
Sintoma: Cliente relata que o sistema sugeriu um par que não é o
correto.

Diagnóstico: o sistema pode errar quando há múltiplos lançamentos
com mesmo valor e data próxima.

Solução:

Cliente clica em Rejeitar no par sugerido errado.

O par volta para "sem par".

Cliente confirma manualmente o par correto (se houver).

Regra de segurança: o sistema nunca confirma par sozinho. Toda
sugestão precisa de confirmação humana.

Prevenção: o usuário deve revisar os sugeridos antes de clicar em
"Confirmar todos".

12. Cliente pede exportação de dados
Sintoma: Cliente envia e-mail/WhatsApp pedindo cópia dos seus dados.

O que fazer:

Orientar o cliente a usar o próprio sistema:

Perfil da Empresa → Meus dados → Baixar cópia dos meus dados

Se o cliente não conseguir:

Fazer login na conta dele (com autorização por escrito).

Ou gerar a exportação pelo painel e enviar por e-mail.

Prazo legal: 15 dias corridos (LGPD art. 19).

Registrar a solicitação em planilha de controle.

Documentação: ver docs/lgpd/procedimento-titulares.md.

13. Cliente pede exclusão de conta
Sintoma: Cliente envia e-mail/WhatsApp pedindo para excluir a conta.

O que fazer:

Confirmar a intenção (é exclusão ou cancelamento?).

Explicar o que acontece:

Dados pessoais são anonimizados imediatamente.

Dados financeiros são retidos por 5 anos (obrigação fiscal).

Acesso é bloqueado imediatamente.

Ação é irreversível.

Se o cliente confirmar, ir em Empresas, clicar na lixeira da
empresa, digitar o nome e confirmar.

Registrar em planilha de controle (LGPD).

Enviar e-mail de confirmação ao cliente.

Documentação: ver docs/lgpd/procedimento-titulares.md e
docs/ciclo-de-vida.md.

14. Cliente quer mudar dados pessoais
Sintoma: Cliente quer corrigir nome, e-mail ou telefone.

O que fazer:

Nome e telefone: o cliente pode editar em Perfil da Empresa.

E-mail (usado no login): só o admin pode alterar (no painel do
Supabase Auth + tabela usuarios).

Dados da empresa: o cliente edita em Perfil da Empresa.

Atenção: ao alterar e-mail, atualizar em dois lugares:

auth.users (Supabase Auth) — é o que faz o login funcionar.

usuarios (tabela pública).

15. Empresa não aparece na lista
Sintoma: Admin não encontra uma empresa em Empresas.

Diagnóstico:

Verifique no Supabase:

sql
SELECT id, nome, status_acesso, arquivada_em
FROM empresas
WHERE nome ILIKE '%parte do nome%';
Se status_acesso = 'arquivada', ela não aparece mesmo — foi
excluída.

Solução:

Causa	Solução
Empresa arquivada	Não aparece por design
Erro de digitação	Buscar por parte do nome
Empresa de outro admin	Verificar se está na conta certa
Prevenção: nenhuma. Arquivamento é intencional.

16. Não consigo criar utilizador
Sintoma: Admin ou dono tenta criar utilizador, mas o sistema
rejeita.

Diagnóstico:

Confirme o plano da empresa:

sql
SELECT p.nome, p.recursos
FROM assinaturas a
JOIN planos p ON p.id = a.plano_id
WHERE a.empresa_id = 'UUID_DA_EMPRESA'
  AND a.status = 'ativo';
Verifique o número atual de utilizadores:

sql
SELECT COUNT(*) FROM user_empresas
WHERE empresa_id = 'UUID_DA_EMPRESA';
Solução:

Causa	Solução
Limite do plano atingido	Orientar upgrade ou solicitar ao admin
E-mail já cadastrado	Verificar em auth.users
Senha muito curta	Mínimo 6 caracteres
Erro na função RPC	Verificar logs do Supabase
Prevenção: documentar o limite de cada plano na tela de criação.

17. Não consigo aprovar um cadastro
Sintoma: Admin tenta aprovar um pedido em Pedidos de contratação
e dá erro.

Diagnóstico:

Verifique em Pedidos de contratação se o pedido está pendente.

Confirme que o e-mail do responsável não está já cadastrado:

sql
SELECT id, email FROM usuarios
WHERE email = 'email@exemplo.com';
Verifique os logs do Supabase em Logs → Edge Functions.

Solução:

Causa	Solução
E-mail já cadastrado	Rejeitar pedido, orientar cliente a recuperar senha
Erro na criação do usuário	Verificar logs do Supabase
Erro na criação da empresa	Verificar se todos os campos obrigatórios foram preenchidos
Função RPC ausente	Verificar se criar_usuario existe no Supabase
Prevenção: validar e-mail no formulário de solicitação (verificar
duplicidade antes de enviar).

Contatos de emergência
Contato	Quando acionar
Supabase Support	Problemas no banco ou autenticação
Vercel Support	Problemas de deploy ou hospedagem
Encarregado LGPD	Pedidos de titular, incidentes
Advogado	Casos jurídicos
Como usar este documento
Cliente reclamou de algo? Busque pelo sintoma no índice.

Não achou? Anote e adicione depois — todo problema recorrente
merece uma entrada aqui.

Resolveu de um jeito diferente? Atualize o documento.

Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial	Jeferson