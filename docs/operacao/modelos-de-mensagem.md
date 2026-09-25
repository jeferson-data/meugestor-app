# Modelos de Mensagem

**Versão:** 1.0
**Data:** 2026-09-25

Este documento reúne modelos prontos de mensagens para o atendimento
ao cliente, por WhatsApp e e-mail.

Todos os modelos estão prontos para copiar, colar e personalizar. Os
campos entre `[colchetes]` precisam ser substituídos antes de enviar.

**Regra de ouro:** nunca envie sem reler. Uma mensagem com `[NOME]` no
lugar do nome do cliente passa uma imagem ruim.

---

## Índice

### Boas-vindas e onboarding
1. [Boas-vindas ao novo cliente](#1-boas-vindas-ao-novo-cliente)
2. [Lembrete de primeiro acesso](#2-lembrete-de-primeiro-acesso)
3. [Boas-vindas ao operador](#3-boas-vindas-ao-operador)

### Comunicação do dia a dia
4. [Aviso de vencimento próximo](#4-aviso-de-vencimento-próximo)
5. [Aviso de suspensão](#5-aviso-de-suspensão)
6. [Confirmação de reativação](#6-confirmação-de-reativação)
7. [Solicitação de informação adicional](#7-solicitação-de-informação-adicional)

### Pedidos e exclusões
8. [Rejeição de cadastro](#8-rejeição-de-cadastro)
9. [Confirmação de exclusão de conta](#9-confirmação-de-exclusão-de-conta)
10. [Confirmação de exportação de dados](#10-confirmação-de-exportação-de-dados)

### Suporte
11. [Recuperação de senha assistida](#11-recuperação-de-senha-assistida)
12. [Problema resolvido](#12-problema-resolvido)
13. [Agradecimento após feedback](#13-agradecimento-após-feedback)

---

## 1. Boas-vindas ao novo cliente

**Quando enviar:** assim que o cadastro for aprovado, junto com as
credenciais.

**Canal preferencial:** WhatsApp (se o cliente cadastrou telefone) ou
e-mail.
Olá, [NOME]! 👋

Seu acesso ao MeuGestor foi aprovado. Bem-vindo(a)!

📱 Link: [URL_DO_SISTEMA]
📧 E-mail: [EMAIL]
🔑 Senha provisória: [SENHA]

Recomendo trocar a senha no primeiro acesso. É rapidinho: na tela de
login, clique em "Esqueci minha senha" e siga as instruções.

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

**Dica:** se o cliente indicou operador, envie também a mensagem 3
para ele.

---

## 2. Lembrete de primeiro acesso

**Quando enviar:** 48 horas depois da aprovação, se o cliente ainda
não acessou.
Olá, [NOME]!

Passando para saber se você conseguiu acessar o MeuGestor com as
credenciais que enviei.

Se tiver qualquer dificuldade, me avise que eu ajudo.

📱 [URL_DO_SISTEMA]

Equipe MeuGestor

text

**Como verificar se o cliente acessou:**
- Supabase → Authentication → Users → coluna "Last Sign In".
- Ou tabela `usuarios` → campo `criado_em` (se for muito recente).

---

## 3. Boas-vindas ao operador

**Quando enviar:** quando o cliente indicou um operador no formulário
e ele foi cadastrado.
Olá, [NOME_OPERADOR]! 👋

Você foi cadastrado(a) como operador(a) no MeuGestor para ajudar a
empresa [NOME_EMPRESA] a registrar as movimentações do dia a dia.

📱 Link: [URL_DO_SISTEMA]
📧 E-mail: [EMAIL]
🔑 Senha provisória: [SENHA]

O que você pode fazer:
• Registrar entradas e saídas
• Ver o extrato
• Ver o dashboard

Recomendo trocar a senha no primeiro acesso, clicando em "Esqueci
minha senha" na tela de login.

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

---

## 4. Aviso de vencimento próximo

**Quando enviar:** 3 a 5 dias antes do vencimento.
Olá, [NOME]!

Passando para lembrar que a mensalidade da empresa [NOME_EMPRESA]
vence em [DATA].

💰 Valor: R$ [VALOR]
📅 Vencimento: [DATA]

Forma de pagamento:
• PIX: [CHAVE_PIX]
• Transferência: [DADOS_BANCARIOS]

Depois de pagar, me envie o comprovante para eu confirmar.

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

---

## 5. Aviso de suspensão

**Quando enviar:** assim que o sistema suspender a conta
automaticamente.
Olá, [NOME]!

Identifiquei que a mensalidade da empresa [NOME_EMPRESA] venceu em
[DATA] e ainda não foi paga.

Por isso, o acesso ao MeuGestor foi suspenso temporariamente.

Assim que o pagamento for confirmado, reativo a conta imediatamente.

💰 Valor: R$ [VALOR]
📅 Vencimento: [DATA]
• PIX: [CHAVE_PIX]
• Transferência: [DADOS_BANCARIOS]

Se já pagou, me envie o comprovante para eu liberar o acesso.

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

**Tom:** amigável, não cobrador. O objetivo é resolver, não constranger.

---

## 6. Confirmação de reativação

**Quando enviar:** depois de confirmar o pagamento e reativar a conta
manualmente.
Olá, [NOME]!

Confirmei o pagamento e reativei o acesso ao MeuGestor.

📱 [URL_DO_SISTEMA]
📧 [EMAIL]

Pode entrar normalmente. Qualquer dúvida, me avise.

Equipe MeuGestor

text

---

## 7. Solicitação de informação adicional

**Quando enviar:** quando um pedido de cadastro está incompleto.
Olá, [NOME]!

Recebi sua solicitação de acesso ao MeuGestor, mas preciso de algumas
informações para prosseguir:

• [INFORMAÇÃO_FALTANTE_1]
• [INFORMAÇÃO_FALTANTE_2]

Assim que me enviar, dou andamento no seu cadastro.

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

---

## 8. Rejeição de cadastro

**Quando enviar:** quando um pedido não pode ser aprovado.
Olá, [NOME]!

Agradeço o interesse no MeuGestor. Analisei sua solicitação, mas
infelizmente não conseguimos prosseguir porque:

[MOTIVO]

Se quiser tentar novamente corrigindo esse ponto, é só preencher o
formulário de novo:

[URL_DO_FORMULARIO]

Qualquer dúvida, é só responder esta mensagem.

Equipe MeuGestor

text

**Tom:** educado, direto, sem julgamento. Sempre dar uma porta de saída.

---

## 9. Confirmação de exclusão de conta

**Quando enviar:** logo após arquivar a empresa pela lixeira.

**Canal:** e-mail (para ter comprovante registrado).
Assunto: Confirmação de exclusão de conta — MeuGestor

Olá, [NOME]!

Confirmamos a exclusão da sua conta no MeuGestor.

O que foi feito:
✅ Seus dados pessoais (nome, e-mail, telefone) foram anonimizados
✅ Sua empresa foi arquivada e não aparece mais no sistema
✅ Seu acesso foi bloqueado imediatamente

O que é mantido por lei:
📁 Seus dados financeiros (movimentações) são mantidos por 5 anos,
conforme exigência do Código Tributário Nacional (arts. 173 e 174).
Depois desse prazo, serão apagados definitivamente.

Se precisar dos seus dados antes disso, é só responder este e-mail.
Podemos enviar uma cópia em CSV.

Qualquer dúvida, estamos à disposição.

Equipe MeuGestor

text

**Importante:** guarde uma cópia deste e-mail como comprovante LGPD.

---

## 10. Confirmação de exportação de dados

**Quando enviar:** quando o cliente pede uma cópia dos dados dele por
e-mail/WhatsApp (não pelo sistema).
Olá, [NOME]!

Conforme solicitado, segue em anexo a cópia dos seus dados no MeuGestor.

O arquivo contém:
📋 Seus dados pessoais
🏢 Dados da empresa
💰 Todas as movimentações
📜 Histórico de atividades

Formato: CSV (abre no Excel, Google Sheets ou qualquer editor de texto).

Se precisar de algum formato específico ou tiver qualquer dúvida, é só
responder este e-mail.

Equipe MeuGestor

text

**Anexar:** o CSV gerado por `MeuGestor → Perfil da Empresa → Meus dados`.

**Prazo legal:** 15 dias corridos a partir do pedido (LGPD art. 19).

---

## 11. Recuperação de senha assistida

**Quando enviar:** quando o cliente não consegue redefinir a senha
sozinho (e-mail não chega, link expirado, etc.).
Olá, [NOME]!

Vi que você está com dificuldade para acessar. Vou te ajudar.

Acabei de gerar uma nova senha provisória para você:

📧 E-mail: [EMAIL]
🔑 Nova senha: [SENHA]

Recomendo trocar no primeiro acesso, clicando em "Esqueci minha senha"
na tela de login.

Se ainda não conseguir, me avise que eu investigo mais a fundo.

Equipe MeuGestor

text

**Como gerar nova senha:** em `Utilizadores` na empresa do cliente,
clique no ícone de chave (🔑) ao lado do nome.

---

## 12. Problema resolvido

**Quando enviar:** depois de resolver um problema reportado pelo
cliente.
Olá, [NOME]!

Sobre o problema que você relatou:

[DESCRIÇÃO_DO_PROBLEMA]

Já resolvemos! ✅

[SE APLICÁVEL: breve explicação do que foi feito]

Pode testar novamente e me dizer se está tudo certo?

Qualquer coisa, é só responder esta mensagem.

Equipe MeuGestor

text

---

## 13. Agradecimento após feedback

**Quando enviar:** quando o cliente dá um feedback útil (elogio,
crítica construtiva, sugestão).
Olá, [NOME]!

Muito obrigado pelo seu feedback sobre [TEMA]. 🙏

[SE FOR MELHORIA: vou avaliar a sugestão para as próximas versões.]
[SE FOR CRÍTICA: já estou trabalhando para melhorar isso.]
[SE FOR ELOGIO: fico muito feliz que esteja gostando!]

Continuo à disposição para o que precisar.

Equipe MeuGestor

text

---

## Boas práticas de comunicação

### Tom e linguagem

- **Amigável, não informal demais.** "Olá" em vez de "Oi, tudo bem?".
- **Direto.** Sem rodeios. Cliente quer resolver, não ler.
- **Sem jargão técnico.** Nunca fale "RLS", "JWT", "deploy".
- **Sem emojis em excesso.** 1 ou 2 por mensagem, no máximo.
- **Assine sempre.** "Equipe MeuGestor" no fim.

### O que NUNCA fazer

- ❌ Enviar senha por canal público.
- ❌ Expor dados de outro cliente.
- ❌ Culpar o cliente pelo problema.
- ❌ Prometer prazo que não pode cumprir.
- ❌ Deixar mensagem sem resposta por mais de 24h.

### O que SEMPRE fazer

- ✅ Responder em até 24h (ideal: no mesmo dia).
- ✅ Confirmar recebimento antes de investigar.
- ✅ Avisar quando resolver.
- ✅ Guardar histórico das conversas.
- ✅ Registrar problemas recorrentes no `troubleshooting.md`.

---

## Frequência de contato

| Situação | Quando contatar |
|----------|-----------------|
| Boas-vindas | Imediatamente após aprovar |
| Lembrete de acesso | 48h depois, se não acessou |
| Vencimento | 3 a 5 dias antes |
| Suspensão | Assim que acontecer |
| Reativação | Assim que confirmar pagamento |
| Recuperação de senha | Sempre que solicitado |
| Confirmação de exclusão | Imediatamente após arquivar |

---

## Canais de atendimento

| Canal | Quando usar |
|-------|-------------|
| **WhatsApp** | Comunicação rápida, avisos, suporte básico |
| **E-mail** | Comunicação formal, confirmações, LGPD |
| **Telefone** | Casos complexos, onboarding assistido |

**Canal preferencial:** WhatsApp (o público-alvo usa mais).

**Canal obrigatório:** e-mail (para ter comprovante em caso de
questionamento legal).

---

## Modelos específicos para LGPD

Pedidos de titular LGPD têm prazo legal de resposta (15 dias corridos).
Use estes modelos especificamente:

### Confirmação de recebimento de pedido LGPD
Assunto: Recebemos sua solicitação — LGPD

Olá, [NOME]!

Recebemos sua solicitação de [TIPO: acesso / correção / exclusão /
portabilidade].

Vamos atender seu pedido em até 15 dias corridos, conforme a LGPD.

Se precisarmos de alguma informação adicional, entraremos em contato
por este mesmo e-mail.

Equipe MeuGestor

text

### Resposta final de pedido LGPD
Assunto: Atendimento à sua solicitação — LGPD

Olá, [NOME]!

Sua solicitação de [TIPO] foi atendida.

[DESCRIÇÃO DO QUE FOI FEITO]

Se tiver qualquer dúvida, é só responder este e-mail.

Equipe MeuGestor

text

Modelos completos em [`docs/lgpd/procedimento-titulares.md`](../lgpd/procedimento-titulares.md).

---

## Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial | Jeferson |