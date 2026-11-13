# Diagnóstico técnico inicial — Meu Gestor

- **Projeto:** Meu Gestor
- **Repositório:** `jeferson-data/meugestor-app`
- **Branch de trabalho:** `docs/engenharia-software-scrum`
- **Data do diagnóstico:** 13/11/2026
- **Status:** diagnóstico preliminar; inventário ainda não concluído

## 1. Objetivo

Registrar o estado conhecido do software antes de revisar sua documentação ou propor alterações funcionais. Este diagnóstico é retrospectivo: descreve evidências encontradas no repositório e separa fatos confirmados de pontos que ainda precisam de inspeção.

O produto tem dois objetivos complementares:

1. **Acadêmico e profissional:** aplicar práticas de Engenharia de Software, com Scrum adaptado ao projeto, documentação rastreável e decisões técnicas justificadas.
2. **Comercial:** evoluir o Meu Gestor para um serviço confiável, utilizável e sustentável para pequenos negócios.

## 2. Evidências consultadas

Foram inspecionados nesta etapa:

- `README.md`
- `package.json`
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`
- `.gitignore`
- `.env.example`

Também foi consultado o diff do commit que revisou o README, identificado como `5b7aaf2cb380dc4084cc2f483cb35c7b47087b85`.

**Limite:** este documento não representa uma auditoria completa do código, banco de dados, políticas do Supabase, funções de backend, deploy ou segurança. Esses itens permanecem no backlog de diagnóstico.

## 3. Visão geral confirmada

O README descreve o Meu Gestor como uma aplicação web para controle de fluxo de caixa, movimentações, pagamentos e gestão operacional de pequenos negócios.

O código de roteamento confirma páginas para:

- Login, recuperação e redefinição de senha;
- Contratação;
- Dashboard;
- Lançamentos;
- Extrato;
- Empresas;
- Pagamentos;
- Utilizadores;
- Vendedores;
- Conciliação;
- Perfil da empresa;
- Pedidos;
- Conta suspensa.

As rotas principais são protegidas por autenticação. O componente `RotaProtegida` também verifica o perfil e o estado de acesso da empresa ativa, bloqueando empresas com status suspenso, suspensa ou arquivada, exceto perfis identificados no código como administradores do programa ou donos do programa.

## 4. Tecnologias e configuração confirmadas

### Dependências de produção

| Tecnologia/pacote | Versão declarada | Uso confirmado ou provável |
|---|---:|---|
| React | ^19.2.8 | Construção da interface |
| React DOM | ^19.2.8 | Renderização no navegador |
| @supabase/supabase-js | ^2.116.0 | Cliente de integração com Supabase |
| React Router DOM | ^7.18.4 | Roteamento da aplicação |
| Recharts | ^3.10.1 | Biblioteca de gráficos |
| Lucide React | ^1.47.0 | Ícones |
| vite-plugin-pwa | ^1.3.0 | Integração PWA com Vite |
| xlsx | ^0.18.5 | Leitura/geração de planilhas; confirmar os fluxos efetivamente usados |

### Dependências de desenvolvimento

| Tecnologia/pacote | Versão declarada | Uso |
|---|---:|---|
| Vite | ^8.3.0 | Servidor de desenvolvimento e build |
| @vitejs/plugin-react | ^6.1.1 | Integração React com Vite |
| Tailwind CSS | ^3.4.17 | Estilização |
| PostCSS | ^8.5.28 | Processamento CSS |
| Autoprefixer | ^10.6.1 | Compatibilidade CSS |
| Oxlint | ^1.81.0 | Análise estática/lint |
| @types/react | ^19.2.18 | Tipos React |
| @types/react-dom | ^19.2.7 | Tipos React DOM |

As versões acima são as declaradas no `package.json`; não representam necessariamente a versão exata instalada. A versão resolvida deve ser confirmada no lockfile.

### Scripts disponíveis

| Script | Comando |
|---|---|
| dev | `vite` |
| build | `vite build` |
| lint | `oxlint` |
| preview | `vite preview` |

Não há script de testes automatizados declarado no `package.json` consultado. Isso não prova que não existam testes manuais ou outros mecanismos fora desses scripts.

## 5. Arquitetura observada inicialmente

O ponto de entrada `src/main.jsx` monta a aplicação React e carrega o CSS global.

O arquivo `src/App.jsx` demonstra:

- React como camada de interface;
- React Router DOM para navegação;
- `AuthProvider` como provedor de contexto de autenticação;
- `AppProvider` como provedor de contexto da aplicação;
- Um componente de layout compartilhado;
- Separação de páginas por funcionalidade;
- Componentes de proteção e redirecionamento de rotas.

O arquivo `vite.config.js` configura o plugin React e o `vite-plugin-pwa`. O manifesto PWA declara nome, descrição, cores, modo de exibição standalone, orientação portrait e ícones. A configuração inclui padrões de arquivos para precache e limpeza de caches antigos. A estratégia e o comportamento offline efetivo ainda precisam ser validados.

## 6. Configuração e proteção de variáveis

O `.env.example` contém os nomes:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O `.gitignore` exclui `.env`, `.env.local` e arquivos locais de ambiente. A presença desses itens é uma evidência de configuração prevista; não substitui a revisão das políticas de segurança do Supabase. Variáveis com prefixo `VITE_` são disponibilizadas ao código do cliente e não devem conter segredos privilegiados.

## 7. Problemas documentais identificados no README

1. O bloco `bash` iniciado na seção de verificação das versões não é fechado depois de `npm --version`. Isso faz com que o restante do documento seja interpretado como código.
2. Os comandos de instalação, títulos, árvore de diretórios e funcionalidades não estão estruturados corretamente em Markdown.
3. O contato do LinkedIn contém o texto provisório `seu-linkedin`.
4. O README afirma “rastreabilidade completa” e “conformidade” sem que a cobertura e o propósito do mecanismo de auditoria tenham sido verificados.
5. Expressões como “automatização completa”, “tempo real” e “pronta para o mercado” precisam ser comprovadas ou reformuladas de maneira mais precisa.
6. A tabela de tecnologias não contempla todas as dependências relevantes, como PWA e XLSX.
7. A estrutura de diretórios apresentada é ilustrativa e ainda não foi comparada com a árvore real do repositório.

## 8. Riscos e pontos que exigem validação antes da comercialização

Os itens abaixo são **perguntas de diagnóstico**, não defeitos confirmados:

- Isolamento dos dados entre empresas/contas e validação das políticas RLS no Supabase;
- Autorização efetiva no banco, além das proteções de interface e rotas;
- Regras para lançamentos, estornos, exclusões, conciliação e fechamento de períodos;
- Integridade e consistência dos cálculos financeiros;
- Tratamento de erros, estados de carregamento e indisponibilidade de serviços;
- Backup, restauração, retenção e descarte de dados;
- Auditoria: eventos registrados, ator, data, entidade afetada e proteção contra alteração;
- LGPD: finalidade, minimização, acesso, transparência e ciclo de vida dos dados pessoais;
- Testes automatizados e processo de validação antes de publicar;
- Monitoramento, logs e resposta a incidentes;
- Termos de uso, política de privacidade, suporte e processo de atendimento;
- Cobrança, cancelamento, inadimplência e limites dos planos, caso sejam oferecidos comercialmente.

## 9. Backlog de diagnóstico

| ID | Atividade | Situação |
|---|---|---|
| DIAG-01 | Inspecionar a árvore completa do repositório | Pendente |
| DIAG-02 | Inventariar e revisar o conteúdo de `docs/` | Pendente |
| DIAG-03 | Mapear páginas, componentes, contextos e serviços | Parcial |
| DIAG-04 | Inspecionar cliente Supabase e chamadas de dados | Pendente |
| DIAG-05 | Inspecionar migrations, schema, funções e políticas RLS | Pendente |
| DIAG-06 | Mapear regras de negócio por módulo | Pendente |
| DIAG-07 | Verificar testes, lint, build e automações de deploy | Pendente |
| DIAG-08 | Revisar README com base no inventário confirmado | Aguardando DIAG-01 a DIAG-07 |

## 10. Critério de conclusão do diagnóstico

O diagnóstico será considerado concluído quando:

- A árvore do repositório tiver sido inventariada;
- A documentação existente tiver sido lida e classificada;
- Os módulos da aplicação e suas integrações estiverem mapeados;
- A estrutura do banco, funções e políticas relevantes estiverem documentadas;
- Cada funcionalidade descrita tiver evidência ou estiver explicitamente marcada como não verificada;
- As lacunas e riscos estiverem priorizados no Product Backlog.

## 11. Próxima decisão

Não alterar regras de negócio nem refatorar funcionalidades nesta fase. Primeiro concluir o diagnóstico e registrar as decisões. Depois, revisar o README e iniciar a especificação formal do produto e dos requisitos.
