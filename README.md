# 💰 MeuGestor — Gestão Financeira Simples para Pequenas Empresas

> **Saia da planilha. Organize seu negócio. Tome decisões com confiança.**

O **MeuGestor** é uma aplicação web completa para controle de fluxo de caixa, movimentações, pagamentos e gestão operacional de pequenos negócios. Foi desenvolvido para ser **simples, acessível e funcional** — sem a complexidade dos ERPs tradicionais.

🔗 **Acesse agora:** [meugestor-app.vercel.app](https://meugestor-app.vercel.app)

---

## 📌 O Problema de Negócio

Pequenas empresas, MEIs e autônomos enfrentam um desafio diário: **organizar as finanças sem depender de sistemas caros e complexos**. Planilhas manuais são propensas a erros, não oferecem visão em tempo real e consomem tempo precioso do gestor.

As consequências são:
- **Falta de visibilidade** sobre o saldo real e o fluxo de caixa;
- **Decisões baseadas em achismo**, não em dados;
- **Dificuldade em controlar pagamentos, vendedores e pedidos**;
- **Perda de dinheiro** por falta de acompanhamento adequado.

## 💡 A Solução

O **MeuGestor** resolve esses problemas com uma interface **intuitiva e responsiva**, que permite ao pequeno empreendedor:

- Visualizar seu **fluxo de caixa em tempo real**;
- Registrar e consultar **movimentações** (entradas e saídas);
- Gerenciar **empresas, vendedores e pedidos** em um só lugar;
- Controlar **pagamentos, assinaturas e planos**;
- Acessar **relatórios e dashboards** com gráficos claros.

Tudo isso **sem instalação**, direto no navegador ou celular.

## 🎯 Resultados e Impacto

- **Automatização completa** do controle financeiro (de planilhas para um sistema web).
- **Visão em tempo real** do saldo e das principais métricas do negócio.
- **Redução de erros manuais** no lançamento e conciliação de dados.
- **Gestão integrada:** financeiro, vendas, pagamentos e auditoria em um único sistema.
- **Acesso em qualquer dispositivo:** computador, tablet ou celular.
- **Modelo de negócio escalável:** Planos de assinatura (Básico, Intermediário, Avançado) para monetização.
- **Registro de auditoria:** Rastreabilidade completa das ações dos usuários.

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso no Projeto |
| :--- | :--- |
| **React 19** | Interface do usuário |
| **Vite** | Build e desenvolvimento |
| **Supabase** | Autenticação e banco de dados |
| **Tailwind CSS** | Estilização |
| **Recharts** | Gráficos e dashboards |
| **React Router** | Navegação entre páginas |
| **Lucide React** | Ícones |
| **Oxlint** | Qualidade de código |
| **Vercel** | Deploy e hospedagem |

## 🖼️ Preview

![Dashboard do MeuGestor](docs/preview-dashboard.png)

*Dashboard com indicadores financeiros, evolução de saldo e ranking de despesas e receitas.*

## 🚀 Como Rodar o Projeto Localmente

### Requisitos

- Node.js 20.19+ ou 22.12+
- npm
- Acesso ao projeto Supabase

Confira as versões:

```bash
node --version
npm --version

Passo a Passo

# 1. Clone o repositório
git clone https://github.com/jeferson-data/meugestor-app.git

# 2. Entre na pasta
cd meugestor-app

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Copie o arquivo .env.example para .env e preencha com suas credenciais do Supabase
cp .env.example .env

# 5. Execute o projeto
npm run dev

Acesse em: http://localhost:5173

📂 Estrutura do Projeto

meugestor-app/
├── docs/                     # Documentação e prints
├── public/                   # Arquivos estáticos
├── src/                      # Código-fonte da aplicação
│   ├── components/           # Componentes React
│   ├── pages/                # Páginas da aplicação
│   ├── services/             # Integração com Supabase
│   └── ...
├── supabase/                 # Funções e configurações do Supabase
│   └── functions/
│       └── criar-vendedor/   # Função para criação de vendedores
├── .env.example              # Exemplo de variáveis de ambiente
├── package.json              # Dependências e scripts
└── README.md                 # Documentação

📈 Funcionalidades Detalhadas
1. Dashboard Financeiro
Indicadores em tempo real (saldo, receitas, despesas).

Gráficos de evolução do saldo e ranking de despesas/receitas.

2. Movimentações
Lançamento de entradas e saídas.

Consulta e filtro por período, categoria e tipo.

3. Extrato e Conciliação
Visualização detalhada de todas as movimentações.

Conciliação de registros para garantir consistência.

4. Gestão de Empresas
Cadastro e gerenciamento de múltiplas empresas.

Controle de acesso por usuário.

5. Pagamentos e Assinaturas
Controle de pagamentos, planos e assinaturas.

Gestão de vencimentos e renovações.

6. Vendedores e Pedidos
Cadastro de vendedores.

Registro e acompanhamento de pedidos.

7. Autenticação e Segurança
Login seguro com Supabase Auth.

Controle de acesso baseado em permissões.

8. Auditoria
Registro de todas as ações dos usuários.

Rastreabilidade completa para conformidade.

🔧 Solução de Problemas
Erro	Causa	Solução
Erro de conexão com Supabase	Variáveis de ambiente	Verifique o arquivo .env
Página em branco	Build não executado	Execute npm run build
Erro de autenticação	Credenciais inválidas	Verifique as configurações do Supabase
Gráficos não renderizam	Dados insuficientes	Cadastre movimentações para visualizar
🧠 Aprendizados e Competências Demonstradas
Este projeto demonstra:

Desenvolvimento Full-Stack: React, Vite, Supabase e Tailwind CSS.

Visão de Produto: Solução completa para um problema real de negócio.

Arquitetura de Software: Estrutura organizada, componentização e boas práticas.

Autenticação e Segurança: Implementação de login e controle de acesso.

Deploy e DevOps: Publicação na Vercel com CI/CD.

Visão de Negócio: Modelo de monetização com planos de assinatura.

UX/UI: Layout responsivo e intuitivo para o usuário final.

🎯 Para Quem é o MeuGestor?
🏪 Pequenas empresas de bairro

🧾 MEIs e autônomos

🛒 Comércios locais que precisam organizar o fluxo de caixa

📈 Negócios que querem sair da planilha e ter um sistema simples

💼 Modelo de Negócio
O MeuGestor opera com planos de assinatura (Básico, Intermediário e Avançado), permitindo que o produto seja monetizado e escalável. É uma solução SaaS (Software as a Service) pronta para o mercado.

📬 Contato
Jeferson Gomes

LinkedIn: seu-linkedin

Email: jefe.gomes@outlook.com

GitHub: jeferson-data

Acesse o app: meugestor-app.vercel.app
