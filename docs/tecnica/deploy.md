# Deploy

**Versão:** 1.0
**Data:** 2026-09-25

Este documento explica como o MeuGestor é publicado em produção, o que
acontece em cada push, e como agir em caso de problemas.

---

## 1. Visão geral

O MeuGestor usa uma arquitetura de deploy **contínuo**:

- **Código-fonte:** GitHub (`jeferson-data/meugestor-app`).
- **Hospedagem:** Vercel (front-end).
- **Banco e autenticação:** Supabase (nuvem).
- **Domínio:** `_[preencher: domínio atual]_`.

Cada push para a branch `main` dispara um deploy automático na Vercel.

---

## 2. Fluxo de deploy
┌──────────────────────────────────────────────┐
│ DESENVOLVEDOR (você) │
└─────────────────────┬────────────────────────┘
│
▼
┌──────────────────────┐
│ git push origin main │
└──────────┬───────────┘
│
▼
┌──────────────────────────────────────────────┐
│ GITHUB │
│ Recebe o push, notifica a Vercel via webhook│
└─────────────────────┬────────────────────────┘
│
▼
┌──────────────────────────────────────────────┐
│ VERCEL │
│ │
│ 1. Clona o repositório │
│ 2. Instala dependências (npm install) │
│ 3. Roda o build (npm run build) │
│ 4. Publica o conteúdo de dist/ │
│ 5. Distribui no CDN global │
│ │
└─────────────────────┬────────────────────────┘
│
▼
┌───────────────┐
│ PRODUÇÃO │
│ Site no ar │
└───────────────┘

text

**Tempo típico:** 1 a 2 minutos do push até o site atualizado.

---

## 3. Tipos de deploy

### 3.1 Deploy de produção

**Quando acontece:** push na branch `main`.

**O que acontece:**
- Vercel roda `npm run build`.
- Se passar, publica em produção.
- URL oficial é atualizada.

**URL:** `https://[seu-projeto].vercel.app` (ou domínio próprio).

### 3.2 Deploy de preview

**Quando acontece:** push em qualquer branch diferente de `main`, ou
abertura de pull request.

**O que acontece:**
- Vercel gera uma URL única para aquela branch.
- Ideal para revisar antes de fazer merge.

**URL:** `https://[projeto]-git-[branch]-[usuario].vercel.app`.

### 3.3 Redeploy manual

**Quando usar:** quando você quer refazer um deploy sem mudar código
(ex.: após mudar variáveis de ambiente).

**Como fazer:**
1. Painel da Vercel → projeto MeuGestor.
2. Aba **Deployments**.
3. Encontre o deploy desejado.
4. Clique nos `...` → **Redeploy**.

---

## 4. Configuração inicial da Vercel

Se você estiver criando o projeto do zero, este é o passo a passo.

### 4.1 Conectar o GitHub

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub.
2. Clique em **Add New → Project**.
3. Selecione o repositório `meugestor-app`.
4. Clique em **Import**.

### 4.2 Configurar o build

A Vercel detecta automaticamente que é um projeto Vite. Confirme:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node Version** | 20.x ou 22.x |

Se estiver tudo padrão, não precisa mexer.

### 4.3 Configurar variáveis de ambiente

Antes do primeiro deploy, configure as variáveis:

1. **Settings → Environment Variables**.
2. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Marque os 3 ambientes: **Production**, **Preview**, **Development**.
4. Salve.

### 4.4 Fazer o primeiro deploy

Clique em **Deploy**. A Vercel vai:
1. Clonar o repositório.
2. Instalar dependências.
3. Rodar `npm run build`.
4. Publicar.

Em 1-2 minutos o site está no ar.

---

## 5. Como fazer deploy

### 5.1 Fluxo normal (via PR)

**Recomendado para todas as mudanças.**

1. Crie uma branch:
   ```bash
   git checkout -b feat/minha-alteracao
Faça a alteração e commite:

bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feat/minha-alteracao
Abra um PR no GitHub.

A Vercel gera automaticamente um preview deploy.

Teste na URL do preview.

Se estiver tudo certo, faça Squash and Merge na main.

A Vercel faz o deploy de produção automaticamente.

5.2 Fluxo direto (não recomendado)
Apenas para emergências.

bash
git checkout main
git pull origin main
# fazer alteração
git add .
git commit -m "fix: corrige problema urgente"
git push origin main
A Vercel faz o deploy de produção direto.

6. Monitorar deploy
6.1 Onde ver
Painel da Vercel → projeto → Deployments.

Lista de todos os deploys, em ordem cronológica.

Cada deploy mostra:

Status: ✅ Ready / ❌ Error / 🔄 Building.

Branch de origem.

Commit hash.

Tempo de build.

URL.

6.2 Logs de build
Se o deploy falhar:

Clique no deploy com erro.

Vá na aba Building.

Role o log até o começo do erro (não só o final — o erro real
está no topo).

Dica: a Vercel corta o começo do log na visualização rápida. Clique
em View Full Log para ver tudo.

6.3 Logs de runtime
Para ver erros em produção (depois do deploy):

Painel da Vercel → Logs.

Filtre por status (500, 404).

Veja requisições com erro.

7. Domínio personalizado
7.1 Como configurar
Painel da Vercel → Settings → Domains.

Adicione o domínio:

meugestor.com.br (principal)

www.meugestor.com.br (redireciona para o principal)

Configure o DNS no registrador do domínio:

Tipo A apontando para 76.76.21.21.

Ou tipo CNAME apontando para cname.vercel-dns.com.

Aguarde a propagação (até 24h, geralmente 5-30 min).

7.2 HTTPS
A Vercel gera certificado SSL automaticamente para domínios
personalizados. Não precisa fazer nada.

7.3 Renovação
Certificados da Vercel renovam automaticamente. Não precisa se
preocupar.

8. Rollback (reverter deploy)
Se um deploy de produção quebrou algo, você pode voltar para a versão
anterior rapidamente.

8.1 Pela Vercel (mais rápido)
Painel da Vercel → Deployments.

Encontre o último deploy que estava funcionando.

Clique nos ... → Promote to Production.

Confirme.

O site volta para aquela versão em ~30 segundos.

8.2 Pelo Git (mais permanente)
Identifique o commit que quebrou:

bash
git log --oneline
Reverta o commit:

bash
git revert [hash-do-commit]
git push origin main
A Vercel faz um novo deploy com o revert.

8.3 Quando usar cada um
Situação	Método
Problema urgente em produção	Promover deploy anterior (Vercel)
Correção permanente	Revert pelo Git
Deploy quebrado no build	Corrigir e fazer novo push
9. Problemas comuns
Deploy falha com "Build failed"
Causas comuns:

Erro de sintaxe no código.

Import quebrado (arquivo não existe).

Variável duplicada (o famoso "redeclared").

Dependência faltando.

Solução:

Veja o log completo (não só o final).

Rode npm run build localmente para reproduzir.

Corrija o erro.

Faça novo push.

Deploy passa, mas o site mostra "404"
Causas:

Arquivo vercel.json com configuração errada.

outputDirectory errado.

Solução:

Verifique se o dist/ foi gerado.

Confirme as configurações de build na Vercel.

Site carrega, mas o login não funciona
Causa: variáveis de ambiente não configuradas na Vercel.

Solução:

Settings → Environment Variables.

Confirme que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão lá.

Faça um Redeploy (as variáveis só entram em vigor em deploys novos).

Site demora para atualizar
Causas:

Cache do CDN (raro, a Vercel invalida rápido).

Cache do navegador.

Solução:

Recarregue com Ctrl + Shift + R (Windows) ou Cmd + Shift + R (Mac).

Teste em janela anônima para confirmar.

Erro "Too many requests" ou rate limit
Causas:

Muitos deploys em pouco tempo.

Plano gratuito da Vercel tem limite.

Solução:

Aguarde 1 hora.

Considere plano pago se for recorrente.

10. Boas práticas
Antes de fazer deploy em produção
□ O código passa em npm run lint.
□ O código passa em npm run build.
□ Foi testado no preview da Vercel.
□ As migrações SQL foram rodadas no Supabase (se aplicável).
□ As variáveis de ambiente estão corretas.
□ Não há console.log esquecido no código.
□ A documentação foi atualizada (se aplicável).
Nunca fazer
❌ Push direto na main sem testar.

❌ Deploy às 23h de sexta (se der problema, ninguém resolve).

❌ Rodar migração SQL em produção sem testar em dev.

❌ Commitar .env.local.

❌ Deploy sem ler o log de build.

Sempre fazer
✅ Usar preview deploy antes de produção.

✅ Fazer deploys em horário comercial.

✅ Avisar se for fazer algo arriscado.

✅ Ter plano de rollback.

11. Ambientes
Ambiente	URL	Banco
Local	http://localhost:5173	Supabase (produção)
Preview	https://[projeto]-git-[branch]-[user].vercel.app	Supabase (produção)
Produção	https://meugestor.com.br	Supabase (produção)
⚠️ Atenção: como o projeto ainda é pequeno, todos os ambientes usam
o mesmo banco Supabase. Isso significa que dados criados em preview
ficam em produção. Cuidado ao testar.

Recomendação futura: criar um projeto Supabase separado para
desenvolvimento quando o volume de testes aumentar.

12. Custo e limites
Plano gratuito da Vercel
Recurso	Limite
Deploys	100/dia
Banda	100 GB/mês
Builds simultâneos	1
Preview deployments	Ilimitados
Domínios personalizados	Ilimitados
SSL	Grátis
Quando considerar plano pago (Pro):

Precisar de mais banda.

Precisar de analytics.

Precisar de suporte prioritário.

Precisar de password protection.

Custo do plano Pro: ~$20/mês.

Plano gratuito do Supabase
Recurso	Limite
Banco	500 MB
Auth	50.000 usuários ativos/mês
Banda	5 GB/mês
Edge Functions	500k chamadas/mês
E-mails	2/hora (SMTP padrão)
Quando considerar plano pago (Pro):

Precisar de mais banco.

Precisar de backups mais frequentes.

Precisar de SMTP próprio sem limite.

Custo do plano Pro: ~$25/mês.

13. Checklist de deploy
Antes de qualquer deploy em produção:

□ Todos os testes locais passam.
□ O build local passa.
□ O preview da Vercel foi testado.
□ As variáveis de ambiente estão corretas.
□ Migrações SQL foram rodadas (se aplicável).
□ A documentação está atualizada.
□ É horário comercial (evitar madrugada).
□ Você tem tempo para resolver se der problema.
14. Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial	Jeferson