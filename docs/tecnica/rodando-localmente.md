# Rodando Localmente

**Versão:** 1.0
**Data:** 2026-09-25

Este documento explica como rodar o MeuGestor na sua máquina, passo a
passo, do zero.

Serve para:
- Você, quando trocar de computador.
- Um desenvolvedor novo que for ajudar no projeto.
- Qualquer pessoa que precise testar o sistema antes de subir para
  produção.

---

## 1. Pré-requisitos

Antes de começar, confirme que tem instalado:

| Ferramenta | Versão mínima | Como verificar |
|------------|:---:|----------------|
| **Node.js** | 20.19+ ou 22.12+ | `node --version` |
| **npm** | 10+ | `npm --version` |
| **Git** | 2.30+ | `git --version` |
| **VS Code** (recomendado) | — | — |

### Como instalar o Node.js

**Windows / macOS:**
1. Baixe em [nodejs.org](https://nodejs.org).
2. Escolha a versão **LTS** (20 ou 22).
3. Instale com as opções padrão.
4. Reinicie o terminal.

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
Verificar se instalou:

bash
node --version   # deve mostrar v20.x ou v22.x
npm --version    # deve mostrar 10.x ou superior
2. Clonar o repositório
Abra o terminal e execute:

bash
git clone https://github.com/jeferson-data/meugestor-app.git
cd meugestor-app
Verificar se clonou:

bash
ls
Deve aparecer uma pasta src/, um arquivo package.json e outros.

3. Instalar dependências
Dentro da pasta do projeto:

bash
npm install
Isso baixa todas as bibliotecas necessárias. Pode levar 1-2 minutos.

Se der erro de permissão (Linux/macOS):

bash
sudo npm install
Se der erro de rede:

Verifique a conexão com a internet.

Se estiver atrás de proxy, configure o npm antes.

4. Configurar variáveis de ambiente
O projeto precisa de duas chaves do Supabase para funcionar.

4.1 Criar o arquivo .env.local
Na raiz do projeto, crie um arquivo chamado .env.local (com o ponto
no começo).

No terminal:

Linux/macOS:

bash
touch .env.local
Windows PowerShell:

powershell
New-Item -Path ".env.local" -ItemType File
Ou: copie o .env.example (se existir):

bash
cp .env.example .env.local
4.2 Preencher as variáveis
Abra o .env.local no VS Code e cole:

bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
De onde vêm esses valores:

Acesse supabase.com e faça login.

Selecione o projeto MeuGestor.

Vá em Settings → API.

Copie:

Project URL → é o VITE_SUPABASE_URL

anon public → é o VITE_SUPABASE_ANON_KEY

⚠️ Importante: use a chave anon public, nunca a service_role.
A service_role ignora RLS e não pode ser exposta no front-end.

4.3 Adicionar .env.local ao .gitignore
Confirme que o arquivo .gitignore na raiz contém a linha:

text
.env.local
Se não tiver, adicione. Nunca commite o .env.local.

5. Rodar o projeto
Com tudo configurado:

bash
npm run dev
Deve aparecer algo assim:

text
  VITE v8.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
Abra o navegador em http://localhost:5173.

6. Testar o login
Você precisa de uma conta para acessar. Duas opções:

Opção A — usar uma conta de teste existente
Se você já tem uma conta no sistema (do ambiente de produção), use as
mesmas credenciais.

Opção B — criar uma conta pelo Supabase
Acesse o painel do Supabase.

Vá em Authentication → Users → Add user.

Preencha:

E-mail

Senha

Marque Auto Confirm User

Depois, no SQL Editor, crie o registro em usuarios:

sql
INSERT INTO usuarios (id, nome, email, role)
VALUES (
  'UUID_DO_AUTH_USERS',
  'Nome de Teste',
  'teste@exemplo.com',
  'dono_cliente'
);
Crie uma empresa de teste:

sql
INSERT INTO empresas (nome, cnpj, status_acesso)
VALUES ('Empresa Teste', '00.000.000/0000-00', 'ativo')
RETURNING id;
Vincule o usuário à empresa:

sql
INSERT INTO user_empresas (usuario_id, empresa_id, papel)
VALUES (
  'UUID_DO_AUTH_USERS',
  'UUID_DA_EMPRESA',
  'dono'
);
Faça login no sistema com esse e-mail.

7. Scripts disponíveis
Comando	O que faz
npm run dev	Inicia o servidor de desenvolvimento em localhost:5173
npm run build	Gera a versão de produção em dist/
npm run preview	Serve o build de produção localmente
npm run lint	Roda o Oxlint (verificação de qualidade)
8. Fluxo de desenvolvimento
8.1 Criar uma branch para sua alteração
bash
git checkout -b feat/minha-alteracao
Use prefixos:

feat/ — nova funcionalidade

fix/ — correção de bug

docs/ — documentação

refactor/ — refatoração

chore/ — tarefas de manutenção

8.2 Fazer a alteração
Edite os arquivos no VS Code. O servidor recarrega automaticamente.

8.3 Verificar antes de commitar
bash
npm run lint
npm run build
Ambos precisam passar sem erro.

8.4 Commitar
bash
git add .
git commit -m "feat: adiciona exportação de dados"
git push origin feat/minha-alteracao
8.5 Abrir pull request
No GitHub, abra um PR da sua branch para main.

A Vercel vai gerar um preview deploy automaticamente, com uma URL
temporária para testar.

9. Problemas comuns
npm install falha com erro de permissão
Linux/macOS:

bash
sudo npm install
Windows: rode o terminal como administrador.

npm run dev não sobe
Erro: "Port 5173 already in use"

Já tem outro projeto rodando na mesma porta. Duas opções:

Feche o outro projeto.

Rode em outra porta: npm run dev -- --port 3000.

Tela branca ao abrir o navegador
Causa provável: variáveis de ambiente erradas.

Abra o console do navegador (F12 → Console).

Procure por erros em vermelho.

Se aparecer "supabaseUrl is required", o .env.local não está sendo
lido.

Solução:

Confirme que o arquivo está na raiz do projeto.

Reinicie o servidor (Ctrl+C e npm run dev).

Login falha com "Invalid credentials"
Causa provável: usuário não existe no Supabase ou senha errada.

Verifique em Authentication → Users se o e-mail está cadastrado.

Erro "relation does not exist"
Causa provável: as tabelas não foram criadas no Supabase.

Rode as migrações SQL (veja docs/tecnica/banco-de-dados.md).

Build falha com "Cannot find module"
Causa provável: dependências desatualizadas.

bash
rm -rf node_modules package-lock.json
npm install
10. Estrutura de arquivos importantes
Arquivo	O que é
src/App.jsx	Rotas da aplicação
src/main.jsx	Ponto de entrada
src/contexts/AuthContext.jsx	Estado de autenticação
src/contexts/AppContext.jsx	Estado global do negócio
src/services/supabase.js	Cliente Supabase
.env.local	Variáveis de ambiente (não versionado)
vite.config.js	Configuração do Vite
tailwind.config.js	Configuração do Tailwind
11. Próximos passos
Depois que o projeto roda localmente:

Leia docs/tecnica/arquitetura.md para entender a
estrutura.

Leia docs/tecnica/banco-de-dados.md para
conhecer as tabelas.

Leia docs/tecnica/contribuindo.md para saber os
padrões de código.

12. Suporte
Se algo não funcionar:

Verifique a seção 9 (Problemas comuns).

Confira os logs do terminal e do navegador.

Se ainda não resolver, abra uma issue no repositório.

13. Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial	Jeferson