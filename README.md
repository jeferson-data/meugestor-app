# MeuGestor

Aplicacao web para gestao financeira e operacional de pequenas empresas. O MeuGestor permite acompanhar movimentacoes, empresas, pagamentos, vendedores e utilizadores em um unico painel, com controle de acesso por usuario, empresa e plano contratado.

## Funcionalidades

- Dashboard com indicadores e analises financeiras.
- Lancamento e consulta de movimentacoes.
- Extrato e conciliação de registros.
- Cadastro e gerenciamento de empresas.
- Controle de pagamentos, assinaturas e planos.
- Cadastro de vendedores e pedidos.
- Gerenciamento de utilizadores e vinculos com empresas.
- Perfil da empresa e registro de auditoria.
- Autenticacao por e-mail e senha.
- Layout responsivo para computador e dispositivos moveis.

## Tecnologias

- React 19 e React Router.
- Vite 8 para desenvolvimento e build.
- Supabase para autenticacao e persistencia de dados.
- Tailwind CSS para estilos.
- Recharts para graficos.
- Lucide React para icones.
- Oxlint para verificacao de qualidade do codigo.

## Requisitos

- Node.js 20.19+ ou 22.12+.
- npm.
- Acesso ao projeto Supabase utilizado pela aplicacao.

Confira as versoes instaladas:

```bash
node --version
npm --version
```

## Rodando no proprio computador

1. Clone o repositorio e entre na pasta do projeto:

   ```bash
   git clone https://github.com/jeferson-data/meugestor-app
   cd meugestor-app
   ```

2. Instale as dependencias:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env.local` na raiz do projeto:

   ```env
  solicite ao desenvolvedor
   ```

   Use os valores fornecidos pelo responsavel pelo projeto Supabase. Nao publique chaves em issues, pull requests ou no README. O arquivo `.env.local` e carregado automaticamente pelo Vite e nao deve ser versionado.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra no navegador o endereco mostrado pelo Vite, normalmente `http://localhost:5173`.

### Windows PowerShell

Os mesmos comandos funcionam no PowerShell. Para criar o arquivo de ambiente rapidamente:

```powershell
Copy-Item .env.example .env.local
```

Depois, preencha os valores de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Se o projeto nao tiver `.env.example`, crie o `.env.local` manualmente usando o modelo acima.

## Estrutura do projeto

```text
src/
  components/     Componentes reutilizaveis e layout da aplicacao
  contexts/       Estado global de autenticacao e da empresa ativa
  hooks/          Hooks reutilizaveis
  pages/          Paginas acessiveis pelas rotas da aplicacao
  services/       Integracoes externas, incluindo Supabase
  utils/          Formatacao, agregacoes e regras auxiliares
```

O ponto de entrada das rotas fica em `src/App.jsx`. A autenticacao e tratada por `AuthContext`; os dados da empresa ativa, movimentacoes e auditoria ficam no `AppContext`.

## Testes locais

O projeto ainda nao possui uma suite automatizada configurada. Para testar uma alteracao, execute a validacao estatica e o build:

```bash
npm run lint
npm run build
```

Depois, rode `npm run dev` e confira manualmente:

1. Login, cadastro e logout.
2. Redirecionamento de usuario nao autenticado para `/login`.
3. Carregamento e troca da empresa ativa.
4. Criacao, edicao, exclusao e filtros de movimentacoes.
5. Dashboard, extrato e conciliação com dados reais de teste.
6. Empresas, pagamentos, vendedores, pedidos e utilizadores conforme o perfil de acesso.
7. Bloqueio de uma conta suspensa e acesso de administradores.
8. Responsividade em uma janela estreita ou no modo de dispositivo do navegador.

Para testar com seguranca, use uma conta e dados de teste no Supabase. Evite alterar dados de producao durante o desenvolvimento.

### Preview do build

Para verificar a versao compilada localmente:

```bash
npm run build
npm run preview
```

## Contribuindo

1. Crie uma branch para a alteracao:

   ```bash
   git checkout -b feat/minha-alteracao
   ```

2. Mantenha cada mudanca focada e siga os padroes existentes do projeto.
3. Execute `npm run lint` e `npm run build` antes de abrir o pull request.
4. Descreva o que mudou, como foi testado e se ha alguma configuracao adicional no Supabase.
5. Nunca inclua senhas, tokens, chaves privadas ou dados reais de clientes no commit.

Ao adicionar uma funcionalidade que dependa de banco de dados, documente as tabelas, politicas de acesso e variaveis de ambiente necessarias para que outra pessoa consiga reproduzir o teste.

## Scripts disponiveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com recarregamento automatico. |
| `npm run build` | Gera a versao de producao em `dist/`. |
| `npm run preview` | Serve localmente o build gerado. |
| `npm run lint` | Executa o Oxlint. |
