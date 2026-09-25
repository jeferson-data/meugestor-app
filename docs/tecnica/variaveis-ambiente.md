# Variáveis de Ambiente

**Versão:** 1.0
**Data:** 2026-09-25

Este documento descreve todas as variáveis de ambiente usadas pelo
MeuGestor: o que são, de onde vêm, como configurar e como proteger.

---

## 1. O que são variáveis de ambiente

São valores que o sistema lê em tempo de execução, em vez de estarem
fixos no código. Servem para:

- **Separar configuração de código.**
- **Guardar segredos** (chaves, tokens) fora do repositório.
- **Trocar valores entre ambientes** (local, preview, produção) sem
  alterar o código.

No MeuGestor, as variáveis ficam em um arquivo `.env.local` na raiz do
projeto.

---

## 2. Arquivo `.env.local`

### 2.1 Onde fica
meugestor-app/
├── .env.local ← aqui (não versionado)
├── package.json
├── src/
└── ...

text

### 2.2 Como criar

**Linux/macOS:**
```bash
touch .env.local
Windows PowerShell:

powershell
New-Item -Path ".env.local" -ItemType File
2.3 O que colocar dentro
bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
2.4 Nunca versionar
Confirme que o .gitignore (na raiz) contém:

text
.env
.env.local
.env.*.local
Se não tiver, adicione essas linhas.

3. Variáveis usadas
3.1 VITE_SUPABASE_URL
Campo	Valor
Tipo	String (URL)
Obrigatória	✅ Sim
Onde é usada	src/services/supabase.js
Prefixo	VITE_ (exposto no front-end)
Sensível	❌ Não
Descrição: URL base do projeto Supabase. Usada para todas as
requisições ao banco, autenticação e RPC.

Formato:

text
https://[project-id].supabase.co
Onde encontrar:

Painel do Supabase → projeto MeuGestor.

Settings → API.

Campo Project URL.

Exemplo:

text
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
3.2 VITE_SUPABASE_ANON_KEY
Campo	Valor
Tipo	String (JWT)
Obrigatória	✅ Sim
Onde é usada	src/services/supabase.js
Prefixo	VITE_ (exposto no front-end)
Sensível	⚠️ Parcialmente — segura se RLS estiver ativo
Descrição: chave pública usada pelo front-end para autenticar com
o Supabase. É um JWT longo (~200 caracteres).

Onde encontrar:

Painel do Supabase → Settings → API.

Campo anon public.

Exemplo:

text
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
⚠️ Importante: esta chave pode ficar no front-end porque a
segurança real vem do Row Level Security (RLS). Se o RLS estiver
configurado corretamente, mesmo com a chave exposta, ninguém acessa
dados de outras empresas.

O que NUNCA colocar no front-end:

service_role key (bypassa RLS — só para back-end).

Senhas de banco.

Tokens de API privados.

4. Como carregar as variáveis
4.1 No desenvolvimento local
O Vite carrega automaticamente o .env.local quando você roda
npm run dev. Não precisa importar nada.

Como o código acessa:

js
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
Regra: todas as variáveis expostas ao front-end precisam começar
com VITE_.

4.2 Em produção (Vercel)
A Vercel não lê o .env.local (que está no .gitignore). As
variáveis precisam ser configuradas no painel da Vercel.

Como configurar:

Acesse vercel.com → projeto MeuGestor.

Vá em Settings → Environment Variables.

Adicione cada variável:

Key: VITE_SUPABASE_URL

Value: https://xxxxx.supabase.co

Environment: marque Production, Preview e Development

Repita para VITE_SUPABASE_ANON_KEY.

Clique em Save.

Faça um novo deploy para as variáveis entrarem em vigor.

Atenção: mudar variáveis na Vercel não atualiza deploys antigos.
Precisa fazer deploy novo (push para main, ou botão "Redeploy").

5. Diferenças entre ambientes
Ambiente	Onde ficam as variáveis	Quem tem acesso
Local	.env.local	Você (na sua máquina)
Preview (Vercel)	Painel da Vercel	Você (admin)
Produção (Vercel)	Painel da Vercel	Você (admin)
Recomendação: usar o mesmo projeto Supabase em todos os
ambientes enquanto o projeto é pequeno. Quando crescer, criar um
projeto Supabase separado para desenvolvimento.

6. Segurança
6.1 O que pode vazar
Variável	Se vazar, o risco é...
VITE_SUPABASE_URL	Baixo — é uma URL pública
VITE_SUPABASE_ANON_KEY	Baixo — se RLS estiver ativo
SUPABASE_SERVICE_ROLE_KEY	CRÍTICO — não deve existir no front-end
6.2 Sinais de que algo vazou
Commits contendo .env.local no GitHub.

Chaves em prints de tela.

Chaves em mensagens de chat.

Chaves coladas em issues públicas.

6.3 O que fazer se vazar
Se for a anon key:

Verifique se o RLS está ativo em todas as tabelas.

Se estiver, o impacto é baixo — a chave é pública por design.

Se não estiver, ative o RLS imediatamente.

Considere rotacionar a chave mesmo assim.

Se for a service_role:

Rotacione imediatamente no painel do Supabase.

Atualize a variável na Vercel.

Faça deploy novo.

Verifique se houve acesso indevido nos logs.

Como rotacionar uma chave no Supabase:

Settings → API → Regenerate.

Copie a nova chave.

Atualize em .env.local e na Vercel.

Faça deploy.

7. Boas práticas
✅ Fazer
Usar .env.local para desenvolvimento.

Configurar variáveis na Vercel para produção.

Confirmar que o .gitignore bloqueia .env*.

Usar o mesmo projeto Supabase enquanto o time é pequeno.

Rotacionar chaves quando desconfiar.

❌ Não fazer
Nunca commitar .env.local.

Nunca colar chaves em issues, PRs ou chats.

Nunca colocar a service_role no front-end.

Nunca usar a anon key como se fosse segredo.

Nunca esquecer de fazer deploy depois de mudar variáveis na Vercel.

8. Como testar se as variáveis estão certas
No desenvolvimento local
Rode npm run dev.

Abra o navegador.

Abra o console (F12 → Console).

Se aparecer:

"supabaseUrl is required" → a variável não foi lida.

"Invalid API key" → a chave está errada.

Sem erro e a tela carrega → está tudo certo.

Em produção
Abra o site da Vercel.

Abra o console (F12).

Faça login.

Se funcionar, as variáveis estão OK.

Se der erro 401 ou 403 no console, é sinal de que a chave está errada
ou o RLS está bloqueando.

9. Variáveis planejadas para o futuro
Estas ainda não são usadas, mas podem entrar em breve:

Variável	Quando será necessária
VITE_APP_URL	Quando implementar e-mails com link de volta
RESEND_API_KEY	Quando configurar SMTP próprio (Resend)
SENTRY_DSN	Quando implementar monitoramento de erros
VITE_GOOGLE_ANALYTICS_ID	Se um dia usar analytics (cuidado: LGPD)
⚠️ Atenção: qualquer variável sem prefixo VITE_ não fica
disponível no front-end. Isso é uma proteção do Vite.

10. Resumo
Variável	Obrigatória	Sensível	Onde configurar
VITE_SUPABASE_URL	✅	❌	.env.local + Vercel
VITE_SUPABASE_ANON_KEY	✅	⚠️	.env.local + Vercel
Regra de ouro: se você não tem certeza se uma variável é sensível,
trate como se fosse. Coloque no .env.local e nunca commite.

11. Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial	Jeferson