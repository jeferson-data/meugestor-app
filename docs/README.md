# Documentação — MeuGestor

Bem-vindo à documentação do **MeuGestor**, uma aplicação web de gestão
financeira para pequenas empresas de bairro.

Este diretório reúne toda a documentação do projeto, organizada por
público e finalidade. Se você está procurando algo específico, use a
tabela abaixo para ir direto ao ponto.

---

## Por onde começar

| Se você é... | Comece por |
|--------------|------------|
| **Novo no projeto** | [Visão geral do produto](produto/visao-geral.md) |
| **Desenvolvedor** | [Arquitetura técnica](tecnica/arquitetura.md) e [Banco de dados](tecnica/banco-de-dados.md) |
| **Cliente / usuário final** | [Manual do usuário](manual/README.md) |
| **Administrador do sistema** | [Manual interno](manual-interno/README.md) |
| **Encarregado de dados (DPO)** | [Documentação LGPD](lgpd/00-LEIA-ME.md) |
| **Interessado em contratar** | [Termo de Abertura do Projeto](TAP.md) |

---

## Estrutura da documentação

docs/
├── README.md ← você está aqui
├── TAP.md ← Termo de Abertura do Projeto
├── ciclo-de-vida.md ← Estados da empresa e prazos
│
├── produto/ ← O que o MeuGestor é e faz
│ ├── visao-geral.md
│ ├── funcionalidades.md
│ ├── planos.md
│ ├── fluxos.md
│ └── regras-de-negocio.md
│
├── tecnica/ ← Como o código está montado
│ ├── arquitetura.md
│ ├── banco-de-dados.md
│ ├── rodando-localmente.md
│ ├── variaveis-ambiente.md
│ ├── deploy.md
│ └── contribuindo.md
│
├── operacao/ ← O que o administrador faz no dia a dia
│ ├── troubleshooting.md
│ ├── modelos-de-mensagem.md
│ └── mudar-plano.md
│
├── manual/ ← Manual do usuário final (PDF)
│ └── README.md
│
├── manual-interno/ ← Manual do administrador
│ └── README.md
│
└── lgpd/ ← Conformidade com a LGPD
├── 00-LEIA-ME.md
├── inventario-pii.md
├── base-legal.md
├── politica-privacidade.md
├── termos-de-uso.md
├── procedimento-titulares.md
├── plano-de-resposta-incidentes.md
├── ciclo-de-vida-dados.md
├── registro-de-aceites.md
└── dpo-encarregado.md


---

## Documentos por finalidade

### 📘 Para entender o produto

- [Visão geral do produto](produto/visao-geral.md) — o que é o MeuGestor,
  para quem é, o que resolve.
- [Funcionalidades](produto/funcionalidades.md) — lista completa de tudo
  que o sistema faz, por módulo.
- [Planos](produto/planos.md) — Básico, Padrão e Completo, com limites.
- [Fluxos](produto/fluxos.md) — diagramas dos fluxos principais
  (solicitação → aprovação, lançamento, conciliação, exclusão).
- [Regras de negócio](produto/regras-de-negocio.md) — retenção fiscal,
  limites de plano, prazos.

### 🛠️ Para mexer no código

- [Arquitetura](tecnica/arquitetura.md) — como o sistema está montado.
- [Banco de dados](tecnica/banco-de-dados.md) — tabelas, colunas e
  relacionamentos.
- [Rodando localmente](tecnica/rodando-localmente.md) — passo a passo
  para subir o projeto na sua máquina.
- [Variáveis de ambiente](tecnica/variaveis-ambiente.md) — o que cada
  variável do `.env` faz.
- [Deploy](tecnica/deploy.md) — como funciona a publicação na Vercel.
- [Contribuindo](tecnica/contribuindo.md) — padrões de código, commits
  e pull requests.

### 🧑‍💼 Para operar o sistema

- [Troubleshooting](operacao/troubleshooting.md) — o que fazer quando
  algo dá errado.
- [Modelos de mensagem](operacao/modelos-de-mensagem.md) — respostas
  prontas para WhatsApp e e-mail.
- [Mudar plano](operacao/mudar-plano.md) — como alterar o plano de um
  cliente.
- [Manual do usuário](manual/README.md) — o que o cliente lê.
- [Manual interno](manual-interno/README.md) — o que o administrador lê.

### ⚖️ Para conformidade legal

- [Documentação LGPD](lgpd/00-LEIA-ME.md) — inventário, base legal,
  política, termos, procedimentos.
- [Ciclo de vida dos dados](ciclo-de-vida.md) — estados da empresa,
  prazos de retenção.
- [Termo de Abertura do Projeto](TAP.md) — visão executiva do projeto.

---

## Convenções

- Todos os documentos estão em **Markdown** (`.md`).
- O nome dos arquivos usa **letras minúsculas** e **hífens** (kebab-case).
- Documentos com `_[preencher]_` são rascunhos que ainda precisam de
  informação.
- Documentos com ⚠️ no topo precisam de **revisão jurídica** antes de
  serem publicados para clientes.
- O conteúdo dos manuais (cliente e interno) é a **fonte única da verdade**:
  PDFs são gerados a partir dele, nunca editados à parte.

---

## Como manter atualizado

- Sempre que uma funcionalidade mudar, atualize o documento correspondente.
- Sempre que uma tabela nova com dados pessoais for criada, atualize o
  [inventário PII](lgpd/inventario-pii.md).
- A cada 6 meses, faça uma revisão geral da documentação.

---

## Contato

- **Responsável pela documentação:** Jeferson
- **Última revisão:** 2026-09-25
- **Próxima revisão prevista:** 2027-03-25

