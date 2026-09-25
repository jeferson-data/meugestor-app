# Contribuindo com o Projeto

**Versão:** 1.0
**Data:** 2026-09-25

Este documento descreve os padrões e processos para contribuir com o
MeuGestor: como criar branches, escrever commits, seguir o estilo de
código, testar e abrir pull requests.

Serve para qualquer pessoa que for mexer no código — inclusive você
mesmo, quando voltar ao projeto depois de um tempo.

---

## 1. Antes de começar

### 1.1 Pré-requisitos

- Ter o projeto rodando localmente (ver
  [`rodando-localmente.md`](rodando-localmente.md)).
- Ter acesso ao repositório no GitHub.
- Ter acesso ao projeto Supabase.

### 1.2 Configurar o Git

Confirme que seu nome e e-mail estão configurados:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
2. Fluxo de trabalho
2.1 Passo a passo
text
1. Atualizar a main
        ↓
2. Criar uma branch para a alteração
        ↓
3. Fazer a alteração em pequenos passos
        ↓
4. Rodar lint e build
        ↓
5. Commitar com mensagem descritiva
        ↓
6. Fazer push
        ↓
7. Abrir pull request
        ↓
8. Revisar, testar no preview da Vercel
        ↓
9. Fazer merge
2.2 Atualizar a main
Antes de criar qualquer branch:

bash
git checkout main
git pull origin main
Isso garante que você está partindo da versão mais recente.

2.3 Criar uma branch
bash
git checkout -b tipo/descricao-curta
Use prefixos para indicar o tipo de mudança (ver seção 3).

Exemplos:

bash
git checkout -b feat/exportacao-dados
git checkout -b fix/categorias-duplicadas
git checkout -b docs/manual-interno
git checkout -b refactor/app-context
3. Padrão de branches
Prefixo	Quando usar	Exemplo
feat/	Nova funcionalidade	feat/conciliacao-ofx
fix/	Correção de bug	fix/login-travando
docs/	Documentação	docs/regras-negocio
refactor/	Refatoração sem mudar comportamento	refactor/app-context
chore/	Tarefas de manutenção	chore/atualiza-dependencias
test/	Adição de testes	test/conciliacao-match
Regras:

Use letras minúsculas.

Use hífen para separar palavras (kebab-case).

Seja descritivo, mas curto.

Nunca trabalhe direto na main.

4. Padrão de commits
4.1 Formato
text
tipo(escopo): descrição curta no imperativo
Exemplos:

text
feat(lgpd): adiciona exportação de dados do titular
fix(conciliacao): corrige match quando há dois candidatos
docs(tecnica): cria guia de variáveis de ambiente
refactor(app-context): extrai funções de categoria
chore(deps): atualiza react para 19.1
4.2 Tipos permitidos
Tipo	Quando usar
feat	Nova funcionalidade
fix	Correção de bug
docs	Apenas documentação
refactor	Refatoração (sem mudar comportamento)
chore	Manutenção (deps, config, etc.)
test	Adição ou ajuste de testes
style	Formatação, sem mudança de lógica
4.3 Regras
Descrição no imperativo: "adiciona", não "adicionado".

Primeira letra minúscula.

Sem ponto final.

Máximo 72 caracteres na primeira linha.

Escopo entre parênteses é opcional, mas ajuda.

4.4 Commits grandes
Se precisar explicar mais, adicione um corpo ao commit:

text
feat(lgpd): adiciona exportação de dados do titular

- Cria arquivo exportarDados.js com gerador de CSV
- Adiciona função exportarMeusDados no AppContext
- Adiciona botão "Baixar cópia dos meus dados" em Perfil da Empresa
- Registra ação no audit_log

Base legal: LGPD art. 18, II e V.
5. Padrão de código
5.1 Nomenclatura
Elemento	Padrão	Exemplo
Componentes React	PascalCase	MeuComponente.jsx
Páginas	PascalCase	Dashboard.jsx
Hooks	camelCase com use	useEmpresaAtiva.js
Utilitários	camelCase	agregacoes.js
Constantes	UPPER_SNAKE_CASE	DIAS_RETENCAO_FISCAL
Variáveis	camelCase	empresaAtiva
Funções	camelCase	adicionarMovimentacao
Tabelas do banco	snake_case	user_empresas
Colunas do banco	snake_case	valor_centavos
5.2 Estrutura de arquivos React
Ordem dos imports:

jsx
// 1. React e bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save } from 'lucide-react';

// 2. Imports internos do projeto
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';

// 3. Utilitários
import { formatarMoeda } from '../utils/formatters';
Ordem dentro do componente:

jsx
export function MeuComponente() {
  // 1. Hooks de contexto
  const { empresaAtiva, perfil } = useApp();
  const navigate = useNavigate();

  // 2. Estados
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // 3. Efeitos
  useEffect(() => {
    // ...
  }, []);

  // 4. Handlers
  const handleSubmit = async (e) => {
    // ...
  };

  // 5. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
5.3 Estilo do código
Boas práticas:

✅ Usar const e let, nunca var.

✅ Preferir arrow functions.

✅ Usar async/await em vez de .then().

✅ Desestruturar objetos.

✅ Usar template literals para strings com variáveis.

✅ Comentar apenas o "por quê", não o "o quê".

Evitar:

❌ Funções com mais de 50 linhas.

❌ Componentes com mais de 300 linhas.

❌ console.log esquecido no código.

❌ any no TypeScript (não usamos TS, mas vale a regra).

❌ Nomes genéricos como data, item, temp.

5.4 Estilo visual (Tailwind)
Ordem das classes:

jsx
<div className="flex items-center justify-between gap-4 bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
  {/* layout → cores → bordas → espaçamento */}
</div>
Cores semânticas do projeto:

brand-green — sucesso, confirmação.

brand-red — erro, perigo, exclusão.

brand-blue — informação.

brand-muted — texto secundário.

brand-subtle — texto terciário.

brand-card — fundo de cartões.

brand-border — bordas.

6. Estrutura de pastas
Respeite a organização existente:

Pasta	O que vai
src/components/ui/	Componentes visuais reutilizáveis (Button, Input)
src/components/layout/	Estrutura de layout (Layout, Sidebar)
src/components/charts/	Gráficos
src/components/conciliacao/	Componentes de conciliação
src/components/conta/	Componentes de ciclo de vida da conta
src/contexts/	Contextos globais
src/hooks/	Hooks reutilizáveis
src/pages/	Uma página por rota
src/services/	Integrações externas
src/utils/	Funções puras, sem React
Regra: se um componente pode ser reutilizado em mais de uma página,
vai em components/. Se é específico de uma página, fica dentro da
página.

7. Checklist antes de commitar
Antes de cada commit, confirme:

□ O código roda sem erro localmente (npm run dev).
□ O lint passa (npm run lint).
□ O build passa (npm run build).
□ Não há console.log esquecido.
□ Não há código comentado sem motivo.
□ Não há .env.local no stage (git status).
□ Não há arquivos de teste ou temporários.
□ Os imports estão organizados na ordem correta.
□ A funcionalidade foi testada manualmente.
Se algum item falhar, não commite ainda.

8. Pull requests
8.1 Antes de abrir
Atualize a branch com a main:

bash
git checkout main
git pull origin main
git checkout sua-branch
git rebase main
Resolva conflitos (se houver).

Rode lint e build.

Faça push.

8.2 Título do PR
Use o mesmo padrão de commit:

text
feat(lgpd): adiciona exportação de dados do titular
8.3 Descrição do PR
Um bom PR responde:

markdown
## O que foi feito
Breve descrição da mudança.

## Por que
Contexto: qual problema resolve, qual necessidade atende.

## Como testar
1. Abrir a tela X.
2. Clicar em Y.
3. Verificar que Z acontece.

## Checklist
- [ ] Lint passa
- [ ] Build passa
- [ ] Testei manualmente
- [ ] Atualizei a documentação (se aplicável)
- [ ] Adicionei entrada no audit_log (se aplicável)

## Screenshots (se aplicável)
[prints de antes e depois]
8.4 Preview deploy
A Vercel gera automaticamente uma URL de preview para cada PR. Use essa
URL para testar antes de fazer merge.

8.5 Merge
Quando o PR estiver pronto:

Confirme que o preview deploy está funcionando.

Faça Squash and Merge (junta todos os commits em um só).

Delete a branch depois do merge.

9. Como adicionar funcionalidades
9.1 Nova página
Criar arquivo em src/pages/NomeDaPagina.jsx.

Adicionar rota no src/App.jsx.

Adicionar item no menu em src/components/layout/.

Documentar no docs/produto/funcionalidades.md (quando existir).

9.2 Nova tabela no banco
Rodar a migração no SQL Editor do Supabase.

Adicionar no docs/tecnica/banco-de-dados.md.

Atualizar o inventário PII em docs/lgpd/inventario-pii.md (se
guardar dados pessoais).

Criar as policies de RLS.

Testar em desenvolvimento antes de aplicar em produção.

9.3 Nova função no AppContext
Criar a função dentro do AppProvider.

Adicionar ao objeto value.

Documentar com comentário breve.

Se for uma ação crítica, chamar registarAuditLog.

10. O que NUNCA fazer
No código
❌ Commitar .env.local.

❌ Usar service_role no front-end.

❌ Desabilitar RLS em qualquer tabela.

❌ Apagar dados sem soft delete (quando aplicável).

❌ Fazer chamadas ao Supabase sem tratar erro.

❌ Esquecer de atualizar o audit_log em ações críticas.

No repositório
❌ Fazer push direto para main (sempre via PR).

❌ Fazer merge sem testar o preview.

❌ Deixar PR aberto por dias sem atualizar.

❌ Commitar arquivos temporários.

❌ Ignorar avisos do lint.

Na comunicação
❌ Colar chaves do Supabase em issues.

❌ Colar dados reais de clientes em prints.

❌ Abrir issue pública com informação sensível.

11. Ferramentas
Obrigatórias
Ferramenta	Para quê
VS Code	Editor
Node.js	Runtime
Git	Versionamento
npm	Pacotes
Recomendadas
Ferramenta	Para quê
Prettier	Formatação automática
ESLint / Oxlint	Qualidade de código
GitLens	Histórico no VS Code
Thunder Client	Testar APIs
Extensões do VS Code
ES7+ React/Redux snippets

Tailwind CSS IntelliSense

Prettier - Code formatter

GitLens

12. Scripts úteis
bash
# Desenvolvimento
npm run dev

# Lint
npm run lint

# Build de produção
npm run build

# Preview do build
npm run preview
13. Dúvidas frequentes
Posso commitar direto na main?
Não. Sempre crie uma branch e abra PR.

Posso fazer merge sem review?
Se você for o único dev, pode. Mas sempre teste no preview da Vercel
antes.

O que faço se o build da Vercel falhar?
Veja o log completo (não só o final). O erro real está no começo.

Esqueci de criar branch. E agora?
Crie a branch agora (git checkout -b nome) — o Git move as mudanças
não commitadas para a nova branch.

Preciso atualizar o README quando mudo algo?
Sim, se a mudança afeta como o projeto é usado (setup, comandos,
arquitetura).

14. Histórico de revisões
Versão	Data	Alterações	Responsável
1.0	2026-09-25	Criação inicial	Jeferson