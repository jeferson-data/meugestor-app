# Fluxos do Sistema

**Versão:** 1.0
**Data:** 2026-09-25

Este documento reúne os fluxos principais do MeuGestor em formato de
diagramas. Cada fluxo mostra o caminho que o usuário percorre e o que
acontece nos bastidores.

---

## Índice

1. [Solicitação → Aprovação → Primeiro acesso](#1-solicitação--aprovação--primeiro-acesso)
2. [Lançamento de movimentação](#2-lançamento-de-movimentação)
3. [Conciliação bancária](#3-conciliação-bancária)
4. [Recuperação de senha](#4-recuperação-de-senha)
5. [Cadastro de utilizador](#5-cadastro-de-utilizador)
6. [Exportação de dados (LGPD)](#6-exportação-de-dados-lgpd)
7. [Exclusão de conta (LGPD)](#7-exclusão-de-conta-lgpd)
8. [Suspensão e reativação](#8-suspensão-e-reativação)
9. [Criação de empresa pelo admin](#9-criação-de-empresa-pelo-admin)

---

## 1. Solicitação → Aprovação → Primeiro acesso

O fluxo mais importante do sistema: como um novo cliente entra.
┌─────────────────────────────────────────────────────────────┐
│ CLIENTE (não tem conta) │
└──────────────────────────┬──────────────────────────────────┘
│
▼
┌────────────────────────┐
│ Preenche formulário │
│ público de solicitação│
└────────────┬───────────┘
│
▼
┌────────────────────────┐
│ Pedido gravado em │
│ pedidos_contratacao │
│ status = 'pendente' │
└────────────┬───────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ ADMIN (MeuGestor) │
└──────────────────────────┬──────────────────────────────────┘
│
▼
┌────────────────────────┐
│ Analisa o pedido em │
│ Pedidos de contratação│
└────────────┬───────────┘
│
┌────────────┴────────────┐
│ │
▼ ▼
┌──────────┐ ┌──────────┐
│ Aprovar │ │ Rejeitar │
└─────┬────┘ └─────┬────┘
│ │
▼ ▼
┌────────────────┐ ┌───────────────┐
│ Sistema cria: │ │ Sistema marca │
│ • auth user │ │ como │
│ • usuarios │ │ 'rejeitado' │
│ • empresas │ └───────────────┘
│ • assinatura │
│ • pagamento │
│ • vínculo │
└────────┬───────┘
│
▼
┌────────────────────┐
│ Popup com senha │
│ provisória e texto │
│ pronto para envio │
└─────────┬──────────┘
│
▼
┌────────────────────┐
│ Admin envia por │
│ WhatsApp ou e-mail │
└─────────┬──────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENTE (com credenciais) │
└──────────────────────────┬──────────────────────────────────┘
│
▼
┌────────────────────────┐
│ Faz login │
│ com senha provisória │
└────────────┬───────────┘
│
▼
┌────────────────────────┐
│ Recomendação: trocar │
│ a senha │
└────────────┬───────────┘
│
▼
┌────────────────────────┐
│ Usa o sistema │
└────────────────────────┘

text

---

## 2. Lançamento de movimentação

Fluxo mais frequente no dia a dia.
┌───────────────────────────────────────────────┐
│ CLIENTE (logado) │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────┐
│ Menu → Lançamentos │
└──────────┬─────────┘
│
▼
┌────────────────────┐
│ Escolhe Entrada │
│ ou Saída │
└──────────┬─────────┘
│
▼
┌────────────────────────────┐
│ Lista de categorias muda │
│ conforme o tipo escolhido │
└──────────┬─────────────────┘
│
▼
┌────────────────────┐
│ Escolhe categoria │
│ Preenche descrição │
│ Informa valor │
│ Confirma data │
│ Escolhe status │
└──────────┬─────────┘
│
▼
┌────────────────────┐
│ Clica em Salvar │
└──────────┬─────────┘
│
▼
┌────────────────────────────┐
│ Front-end valida: │
│ • categoria pertence │
│ ao tipo? │
│ • valor > 0? │
│ • descrição preenchida? │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Supabase insere em │
│ movimentacoes │
│ (RLS valida permissão) │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Audit log registra a ação │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente é redirecionado │
│ para /extrato │
└────────────────────────────┘

text

---

## 3. Conciliação bancária

Fluxo exclusivo do plano Completo.
┌───────────────────────────────────────────────┐
│ CLIENTE (plano Completo) │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────┐
│ Menu → Conciliação │
└──────────┬─────────┘
│
▼
┌────────────────────────────┐
│ Exporta extrato do banco │
│ como CSV ou XLSX │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Arrasta o arquivo para a │
│ área de upload │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Sistema lê as colunas e │
│ tenta adivinhar: │
│ • data │
│ • descrição │
│ • valor │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente confere o │
│ mapeamento e ajusta se │
│ necessário │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Escolhe se é Extrato de │
│ Entradas ou de Saídas │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Sistema processa: │
│ para cada item do arquivo: │
│ • busca movimentação │
│ com mesmo valor exato │
│ • mesma direção │
│ • data ±1 dia │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────────────┐
│ Resultado dividido em: │
│ 🟡 Sugeridos (match provável) │
│ 🟢 Conciliados (confirmados) │
│ 🔴 Sem par (não encontrado) │
└──────────┬─────────────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente confirma item a │
│ item, ou clica em │
│ "Confirmar todos" │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Cada confirmação grava em │
│ conciliacoes + audit_log │
└────────────────────────────┘

text

---

## 4. Recuperação de senha
┌───────────────────────────────────────────────┐
│ CLIENTE (deslogado) │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Tela de login → clique em │
│ "Esqueci minha senha" │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Digita o e-mail │
│ Clica em Enviar link │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Supabase gera token único │
│ e envia e-mail │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Tela "Verifique seu e-mail"│
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente abre o e-mail │
│ Clica no link │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Supabase cria sessão │
│ temporária │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Tela /redefinir-senha │
│ Digita a nova senha 2x │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Sistema atualiza senha │
│ Faz signOut() │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Redireciona para /login │
│ com faixa verde │
└────────────────────────────┘

text

---

## 5. Cadastro de utilizador
┌───────────────────────────────────────────────┐
│ DONO DA CONTA │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────┐
│ Menu → Utilizadores│
└──────────┬─────────┘
│
▼
┌────────────────────────────┐
│ Já tem utilizador? │
│ Plano permite mais? │
└──────────┬─────────────────┘
│
┌──────────┴────────────┐
│ │
▼ ▼
┌───────────┐ ┌──────────────┐
│ Pode criar│ │ Limite │
│ │ │ atingido │
└─────┬─────┘ └──────┬───────┘
│ │
▼ ▼
┌────────────────┐ ┌──────────────┐
│ Clica em Novo │ │ Mensagem: │
│ Utilizador │ │ "Fale com o │
└────────┬───────┘ │ suporte" │
│ └──────────────┘
▼
┌────────────────────────────┐
│ Preenche: nome, e-mail, │
│ senha provisória, telefone │
│ escolhe papel (operador/ │
│ leitor) │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Sistema cria auth user + │
│ registro em usuarios │
│ + vínculo em user_empresas │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Dono envia credenciais │
│ ao novo utilizador │
└────────────────────────────┘

text

---

## 6. Exportação de dados (LGPD)
┌───────────────────────────────────────────────┐
│ CLIENTE (logado) │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Menu → Perfil da Empresa │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Rola até bloco "Meus dados"│
│ Clica em Baixar cópia │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Sistema gera CSV com: │
│ • dados pessoais │
│ • dados da empresa │
│ • movimentações │
│ • histórico de atividades │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Arquivo baixado │
│ Audit log registra ação │
└────────────────────────────┘

text

---

## 7. Exclusão de conta (LGPD)
┌───────────────────────────────────────────────┐
│ ADMIN │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente pediu exclusão via │
│ WhatsApp/e-mail │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Admin confirma intenção │
│ Explica o que vai acontecer│
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Menu → Empresas → lixeira │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Modal pede confirmação │
│ Admin digita o nome da │
│ empresa │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────────────────┐
│ Sistema executa em ordem: │
│ 1. Anonimiza usuários │
│ 2. Encerra assinatura ativa │
│ 3. Cancela pagamentos pendentes │
│ 4. Marca movimentações para retenção │
│ (hoje + 5 anos) │
│ 5. Marca empresa como 'arquivada' │
│ 6. Registra em solicitacoes_exclusao │
│ 7. Registra em audit_log │
└──────────┬─────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Empresa some da lista │
│ Cliente perde acesso │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Admin envia e-mail de │
│ confirmação (com aviso │
│ sobre retenção de 5 anos) │
└────────────────────────────┘

text

---

## 8. Suspensão e reativação
┌───────────────────────────────────────────────┐
│ SISTEMA │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Vencimento passa sem │
│ pagamento │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ status_acesso = 'suspenso' │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Cliente vê tela de │
│ "Conta suspensa" ao logar │
└──────────┬─────────────────┘
│
▼
┌───────────────────────────────────────────────┐
│ CLIENTE │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Paga por PIX/transferência │
│ Envia comprovante │
└──────────┬─────────────────┘
│
▼
┌───────────────────────────────────────────────┐
│ ADMIN │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Confere comprovante │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Menu → Empresas → Ativar │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ status_acesso = 'ativo' │
│ Cliente recupera acesso │
└────────────────────────────┘

text

---

## 9. Criação de empresa pelo admin

Quando o admin cria uma empresa manualmente (sem passar pelo formulário
público).
┌───────────────────────────────────────────────┐
│ ADMIN │
└──────────────────┬────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Menu → Empresas │
│ Clica em Nova empresa │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────┐
│ Preenche: nome, CNPJ, │
│ telefone, e-mail, │
│ endereço, plano inicial │
└──────────┬─────────────────┘
│
▼
┌────────────────────────────────────────┐
│ Sistema executa em ordem: │
│ 1. Insere em empresas │
│ 2. Insere assinatura (fim +30 dias) │
│ 3. Insere pagamento pendente │
└──────────┬─────────────────────────────┘
│
▼
┌────────────────────────────┐
│ Empresa aparece na lista │
│ Admin vincula utilizadores │
│ depois │
└────────────────────────────┘

text

---

## Notas sobre os fluxos

- **Nunca há auto-cadastro.** Todo acesso passa por aprovação.
- **Nunca há match automático** na conciliação. Sempre com confirmação.
- **Nunca há exclusão imediata.** Sempre com anonimização + retenção.
- **Nunca há cobrança automatizada.** Pagamento é manual (PIX/transferência).

---

## Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial | Jeferson |