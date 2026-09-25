# Arquitetura Técnica

**Versão:** 1.0
**Data:** 2026-09-25

Este documento descreve como o MeuGestor está montado tecnicamente:
as camadas, as tecnologias, os fluxos de dados e as decisões de
arquitetura.

Serve como mapa para quem for mexer no código, fazer manutenção ou
entender como as peças se encaixam.

---

## 1. Visão em uma imagem
┌───────────────────────────────────────────────────────────────┐
│ NAVEGADOR │
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Aplicação React (SPA) │ │
│ │ │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │ │
│ │ │ Contexts │ │ Páginas │ │ Componentes │ │ │
│ │ │ (state) │ │ (rotas) │ │ (UI) │ │ │
│ │ └──────────┘ └──────────┘ └──────────────┘ │ │
│ │ │ │
│ │ ┌────────────────────┐ │ │
│ │ │ Supabase SDK │ │ │
│ │ └─────────┬──────────┘ │ │
│ └────────────────────────┼────────────────────────────┘ │
│ │ │
└────────────────────────────┼──────────────────────────────────┘
│
│ HTTPS
│
▼
┌───────────────────────────────┐
│ SUPABASE │
│ │
│ ┌───────────────────────┐ │
│ │ Auth (auth.users) │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ PostgreSQL (public) │ │
│ │ + RLS policies │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ Edge Functions (RPC) │ │
│ └───────────────────────┘ │
└───────────────────────────────┘

┌───────────────────────────────┐
│ VERCEL │
│ (hospeda o front-end) │
│ + deploy automático │
└───────────────────────────────┘

text

---

## 2. Camadas da aplicação

### 2.1 Front-end (React)

Aplicação de página única (SPA) construída com **React 19** e **Vite 8**.

**Responsabilidades:**
- Renderizar as telas.
- Gerenciar estado de sessão e empresa ativa.
- Validar dados antes de enviar ao Supabase.
- Mostrar feedback ao usuário.

**Não faz:**
- Não tem back-end próprio.
- Não tem API intermediária.
- Não guarda dados sensíveis em `localStorage`.

### 2.2 Estilo (Tailwind CSS)

Toda a interface usa **Tailwind CSS**, com paleta customizada (`brand-*`).

**Convenções:**
- Cores semânticas: `brand-green` (sucesso), `brand-red` (erro),
  `brand-blue` (informação).
- Classes utilitárias, sem CSS separado.
- Componentes reutilizáveis em `src/components/ui/`.

### 2.3 Gráficos (Recharts)

Gráficos do dashboard usam **Recharts**:
- `ComposedChart` para misturar barras e linhas.
- `BarChart` para top categorias.
- Dados agregados em `src/utils/agregacoes.js`.

### 2.4 Backend (Supabase)

O **Supabase** faz o papel de back-end completo:

- **Auth**: autenticação por e-mail + senha.
- **Database**: PostgreSQL gerenciado.
- **RLS**: políticas de segurança por linha.
- **Edge Functions**: funções RPC em SQL.
- **Storage**: não usado atualmente.

### 2.5 Hospedagem (Vercel)

O front-end é hospedado na **Vercel**, com:

- **Deploy automático** a cada push em `main`.
- **Preview deploy** para pull requests.
- **HTTPS** gratuito.
- **CDN global**.

---

## 3. Fluxo de dados

### 3.1 Login
Usuário digita e-mail + senha
↓

Front-end chama supabase.auth.signInWithPassword()
↓

Supabase valida
↓

Front-end recebe sessão JWT
↓

AuthContext guarda o usuário
↓

AppContext carrega perfil + empresas
↓

Usuário é redirecionado para o Dashboard

text

### 3.2 Carregamento de movimentações
Usuário entra na página Extrato
↓

AppContext detecta empresaAtiva
↓

Chama supabase.from('movimentacoes').select()
↓

RLS filtra automaticamente: só movimentações das empresas vinculadas
↓

Dados chegam e populam o estado
↓

Extrato renderiza

text

### 3.3 Criação de lançamento
Usuário preenche o formulário
↓

Lancamentos.jsx valida localmente
↓

Chama adicionarMovimentacao() no AppContext
↓

AppContext valida categoria + valor
↓

Supabase insere em movimentacoes
↓

RLS garante que o usuário pode escrever
↓

AppContext atualiza o estado local
↓

Redireciona para /extrato

text

### 3.4 Recuperação de senha
Usuário clica em "Esqueci minha senha"
↓

Digita e-mail, chama resetPasswordForEmail()
↓

Supabase envia e-mail com link único
↓

Usuário clica no link
↓

Supabase cria sessão temporária
↓

Front-end detecta e mostra tela /redefinir-senha
↓

Usuário digita nova senha
↓

Chama updateUser({ password })
↓

Supabase atualiza
↓

Front-end faz signOut() e volta para /login

text

### 3.5 Arquivamento de empresa
Admin clica na lixeira em /empresas
↓

Modal pede confirmação com nome da empresa
↓

Admin confirma, chama arquivarEmpresa() no AppContext
↓

AppContext executa, em ordem:
a. Anonimiza usuários vinculados
b. Encerra assinatura ativa
c. Cancela pagamentos pendentes
d. Marca movimentações com retida_ate (+5 anos)
e. Marca empresa como 'arquivada'
f. Registra em solicitacoes_exclusao
g. Registra no audit_log
↓

Empresa some da lista

text

---

## 4. Estrutura de pastas
meugestor-app/
├── public/ ← arquivos estáticos
│ └── logo-full.svg
│
├── src/
│ ├── components/ ← componentes reutilizáveis
│ │ ├── layout/ ← header, sidebar, layout geral
│ │ ├── ui/ ← Button, Input, Card (design system)
│ │ ├── charts/ ← gráficos (Recharts)
│ │ ├── conciliacao/ ← componentes da conciliação
│ │ ├── conta/ ← ciclo de vida da conta
│ │ └── PainelAnalise.jsx
│ │
│ ├── contexts/ ← estado global
│ │ ├── AuthContext.jsx ← sessão e login
│ │ └── AppContext.jsx ← perfil, empresas, movimentações
│ │
│ ├── hooks/ ← hooks reutilizáveis
│ │ ├── useEmpresaAtiva.js
│ │ └── usePlano.js
│ │
│ ├── pages/ ← uma página por rota
│ │ ├── Login.jsx
│ │ ├── EsqueciSenha.jsx
│ │ ├── RedefinirSenha.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Lancamentos.jsx
│ │ ├── Extrato.jsx
│ │ ├── Empresas.jsx
│ │ ├── Pagamentos.jsx
│ │ ├── Utilizadores.jsx
│ │ ├── Vendedores.jsx
│ │ ├── Conciliacao.jsx
│ │ ├── PerfilEmpresa.jsx
│ │ ├── Pedidos.jsx
│ │ └── ContaSuspensa.jsx
│ │
│ ├── services/ ← integrações externas
│ │ └── supabase.js ← cliente Supabase
│ │
│ ├── utils/ ← funções puras
│ │ ├── agregacoes.js
│ │ ├── categorias.js
│ │ ├── cicloDeVida.js
│ │ ├── conciliacao.js
│ │ ├── exportarDados.js
│ │ ├── formatters.js
│ │ └── analise.js
│ │
│ ├── App.jsx ← rotas
│ ├── main.jsx ← entrada
│ └── index.css ← estilos globais
│
├── supabase/ ← migrações e functions
│ ├── migrations/
│ └── functions/
│
├── docs/ ← documentação
│
├── .env.local ← variáveis de ambiente (não versionado)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md

text

---

## 5. Gerenciamento de estado

### 5.1 AuthContext

Responsável por:

- Sessão do usuário (JWT).
- Funções `login`, `logout`, `cadastro`.
- Estado `user` e `loading`.

**Não guarda:** dados de negócio (empresas, movimentações).

### 5.2 AppContext

Responsável por:

- Perfil do usuário (`usuarios`).
- Lista de empresas do usuário.
- Empresa ativa (persistida em `localStorage`).
- Movimentações da empresa ativa.
- Trilha de auditoria.
- Conciliações.
- Plano e recursos.
- Todas as funções de CRUD.

**Por que um só contexto:** simplifica o acesso. Em vez de vários
contextos (`EmpresasContext`, `MovimentacoesContext`, etc.), tudo fica
em um só, com funções bem nomeadas.

**Trade-off:** o `AppContext` é grande (mais de 600 linhas). Se crescer
muito, faz sentido dividir.

### 5.3 Estado local

- Formulários usam `useState` local.
- Filtros usam `useState` local.
- Modais usam `useState` local.

---

## 6. Segurança

### 6.1 Autenticação

- Supabase Auth gerencia as sessões.
- JWT com expiração automática.
- Renovação automática de token pelo SDK.

### 6.2 Autorização

- **Row Level Security (RLS)** em todas as 14 tabelas.
- Cada usuário vê apenas dados das empresas às quais está vinculado.
- Admin (`admin_programa`, `dono_programa`) vê tudo.

### 6.3 Validação

- **Front-end**: validação de formulário (obrigatoriedade, formato).
- **Banco**: `CHECK` constraints para valores válidos.
- **RLS**: bloqueia acesso a dados de terceiros.

### 6.4 Boas práticas aplicadas

- ✅ Nunca versionar `.env.local`.
- ✅ Chaves do Supabase só no front-end com a `anon key` (segura por
  design, desde que RLS esteja ativo).
- ✅ Sem `service_role key` no front-end.
- ✅ Uso de `redirectTo` no reset de senha, com URL validada.
- ✅ Senhas com hash bcrypt no Supabase.

---

## 7. Decisões de arquitetura

### 7.1 Por que Supabase e não back-end próprio

- **Custo:** grátis até certo ponto, depois barato.
- **Velocidade de desenvolvimento:** auth + DB prontos.
- **RLS:** segurança no banco sem código.
- **Trade-off:** lock-in. Migrar depois exige esforço.

### 7.2 Por que React SPA e não SSR (Next.js)

- **Simplicidade:** não precisa de servidor.
- **Custo:** hospedagem estática na Vercel.
- **Suficiente:** app interno, não precisa de SEO.
- **Trade-off:** primeira carga um pouco mais lenta; SEO ruim (não é
  prioridade para um app logado).

### 7.3 Por que Vite e não CRA

- **Velocidade:** build e hot reload muito mais rápidos.
- **Moderno:** suporte nativo a ES modules.
- **Padrão de mercado:** CRA está descontinuado.

### 7.4 Por que Tailwind e não CSS-in-JS

- **Velocidade:** prototipagem rápida.
- **Consistência:** classes utilitárias garantem padrão visual.
- **Zero runtime:** sem custo em produção.
- **Trade-off:** HTML fica verboso. Aceitável.

### 7.5 Por que categorias fechadas

- **Gráficos funcionam:** agrupamento confiável.
- **Relatórios coerentes:** sem dados sujos.
- **Trade-off:** cliente não pode personalizar. Aceitável para o
  público-alvo.

### 7.6 Por que retenção fiscal de 5 anos

- **Obrigação legal:** CTN art. 173 e 174.
- **LGPD permite:** art. 16, I (obrigação legal).
- **Trade-off:** armazenamento a mais. Aceitável.

---

## 8. Integrações externas

| Serviço | Uso | Obrigatório? |
|---------|-----|:---:|
| Supabase | Auth + Database | ✅ Sim |
| Vercel | Hospedagem | ✅ Sim |
| Provedor de e-mail (SMTP) | Envio de e-mails transacionais | ⏳ Pendente |
| Provedor de pagamento | Cobrança automatizada | ❌ Fora do escopo |

---

## 9. Diagrama de rotas
/ → Dashboard (protegida)
/login → Login (pública, redireciona se logado)
/esqueci-senha → Recuperação (aberta)
/redefinir-senha → Nova senha (aberta)
/contratar → Formulário público (aberta)
/lancamentos → Lançamentos (protegida)
/extrato → Extrato (protegida)
/empresas → Empresas (protegida)
/pagamentos → Pagamentos (protegida)
/utilizadores → Utilizadores (protegida)
/vendedores → Vendedores (protegida)
/conciliacao → Conciliação (protegida, plano Completo)
/perfil-empresa → Perfil da empresa (protegida)
/pedidos → Pedidos de contratação (protegida, admin)

→ Redireciona para /

text

### Tipos de rota

| Tipo | Comportamento |
|------|---------------|
| **Pública com redirecionamento** | Se logado, vai para `/` (ex.: `/login`) |
| **Pública sem redirecionamento** | Aberta mesmo logado (ex.: `/esqueci-senha`) |
| **Protegida** | Exige login (ex.: `/extrato`) |
| **Protegida com gate de plano** | Exige login + plano específico (ex.: `/conciliacao`) |

---

## 10. O que não existe na arquitetura (e por quê)

| Não existe | Por quê |
|-----------|---------|
| Back-end próprio (Node, Python) | Supabase supre a necessidade |
| API REST intermediária | SDK do Supabase acessa direto |
| Estado global com Redux/Zustand | Context API é suficiente |
| Testes automatizados | Ainda não implementados (pendência) |
| SSR (Next.js) | App interno, sem necessidade de SEO |
| Cache HTTP | RLS + Supabase cuidam da performance |
| Fila de jobs | Nada assíncrono por enquanto |
| WebSockets | Sem necessidade de real-time |

---

## 11. Pendências arquiteturais

- [ ] Configurar SMTP próprio (Resend, Brevo, SendGrid)
- [ ] Implementar job de expurgo (pg_cron)
- [ ] Adicionar testes automatizados (Vitest)
- [ ] Configurar monitoramento de erros (Sentry)
- [ ] Documentar variáveis de ambiente em `docs/tecnica/variaveis-ambiente.md`
- [ ] Padronizar `conciliacoes.created_at` → `criado_em`
- [ ] Avaliar divisão do `AppContext` em contextos menores
- [ ] Adicionar rate limiting em endpoints públicos (formulário)

---

## 12. Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial | Jeferson |