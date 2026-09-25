# Visão Geral do Produto

**Versão:** 1.0
**Data:** 2026-09-25

Este documento apresenta o MeuGestor em linguagem acessível, para
qualquer pessoa que precise entender o produto sem entrar em detalhes
técnicos.

---

## 1. O que é o MeuGestor

O **MeuGestor** é uma aplicação web de gestão financeira e operacional
para **pequenas empresas de bairro**.

Em uma frase: **o caderno de caixa digital que o pequeno empreendedor
consegue usar sem saber contabilidade.**

O sistema permite:

- Registrar entradas e saídas do dia a dia.
- Ver o extrato de tudo que passou pelo caixa.
- Entender o resultado do mês em uma tela só (dashboard).
- Conciliar o extrato do banco com o que foi lançado no sistema.
- Exportar os dados a qualquer momento.
- Acessar pelo celular ou computador.

---

## 2. Para quem é

O MeuGestor foi pensado para **pequenos negócios de bairro**, como:

- Mercearias e minimercados
- Padarias e lanchonetes
- Salões de beleza e barbearias
- Oficinas mecânicas
- Lojas de roupa e acessórios
- Prestadores de serviço autônomos (eletricistas, encanadores, diaristas)
- Pequenos escritórios

### Perfil do cliente típico

- **Faturamento:** até R$ 50.000/mês.
- **Equipe:** dono + 0 a 3 funcionários.
- **Ferramenta atual:** caderno, planilha solta ou aplicativo genérico.
- **Conhecimento contábil:** nenhum ou muito básico.
- **Dispositivo principal:** celular.
- **Dores:**
  - Não sabe se o mês deu lucro ou prejuízo até o dinheiro acabar.
  - Mistura o caixa da empresa com o bolso pessoal.
  - Não consegue acompanhar pagamentos pendentes.
  - Perde tempo fechando o mês no caderno.

### Para quem NÃO é

- Médias e grandes empresas (já têm ERP).
- Quem precisa de emissão de nota fiscal (não fazemos).
- Quem precisa de folha de pagamento (não fazemos).
- Quem busca integração bancária automática (não fazemos — a
  conciliação é por upload de arquivo).

---

## 3. O que o MeuGestor resolve

| Problema do cliente | Como o MeuGestor resolve |
|---------------------|--------------------------|
| "Não sei se o mês deu lucro" | Dashboard mostra receita, despesa e resultado em tempo real |
| "Misturo o caixa da empresa com o meu" | Categoria "Retirada do dono" separa o que é do negócio e o que é pessoal |
| "Não sei o que ainda tenho para receber" | Cartão "Contas a Receber" mostra os lançamentos pendentes de entrada |
| "Perco tempo fechando o mês no caderno" | O sistema soma tudo sozinho e mostra em uma tela |
| "Não consigo bater o extrato do banco" | Conciliação importa o CSV do banco e sugere os pares |
| "Não sei se posso confiar no que anotei" | Trilha de auditoria registra quem fez o quê e quando |
| "E se eu quiser sair do sistema?" | Exportação de todos os dados em CSV a qualquer momento (LGPD) |

---

## 4. Princípios do produto

Toda decisão de design do MeuGestor segue estes três princípios:

### 4.1 Simplicidade radical

Qualquer funcionalidade precisa ser usável por alguém que **nunca teve
contato com contabilidade**. Se exige explicação, está errada.

**Na prática:**
- Categorias fechadas (não texto livre).
- Botões grandes e claros.
- Sem jargão técnico.
- Sem telas com 20 campos.

### 4.2 Preço acessível

A arquitetura roda com custo de infraestrutura baixo, permitindo planos
que cabem no bolso do pequeno empreendedor.

**Na prática:**
- Planos de R$ 49, R$ 89 e R$ 149/mês.
- Sem cobrança por transação.
- Sem taxa de setup.

### 4.3 Foco no que importa para o bairro

O sistema trata do que um pequeno negócio de bairro realmente precisa,
não do que um contador gostaria que ele tivesse.

**Na prática:**
- "Retirada do dono" é uma categoria própria.
- "Maquininha de cartão" é uma forma de entrada.
- "Mercadorias e fornecedores" agrupa compras e pagamentos.
- Sem DRE, sem balanço, sem plano de contas.

---

## 5. Funcionalidades principais

### Para o dono da empresa

- **Dashboard** com KPIs do mês (receita, despesa, resultado, margem).
- **Lançamentos** de entrada e saída com categoria padronizada.
- **Extrato** com filtros por data, tipo e status.
- **Gráficos** de evolução diária e mensal.
- **Top 10 categorias** de despesa e receita.
- **Conciliação bancária** por upload de CSV/XLSX (plano Completo).
- **Perfil da empresa** (nome, CNPJ, endereço, contato).
- **Exportação de dados** em CSV, a qualquer momento (LGPD).
- **Cancelamento e exclusão** com retenção fiscal.

### Para o operador (funcionário)

- Fazer lançamentos.
- Ver extrato e dashboard.
- Sem acesso a configurações, pagamentos ou utilizadores.

### Para o administrador (MeuGestor)

- Aprovar/rejeitar pedidos de contratação.
- Criar e gerenciar empresas.
- Alterar planos.
- Suspender e liberar acesso.
- Arquivar empresas (com anonimização e retenção fiscal).
- Ver trilha de auditoria completa.

---

## 6. Modelo de planos

| Recurso | **Básico** R$ 49/mês | **Padrão** R$ 89/mês | **Completo** R$ 149/mês |
|---------|:---:|:---:|:---:|
| Lançamentos, Dashboard e Extrato | ✅ | ✅ | ✅ |
| Relatórios mensais | ❌ | ✅ | ✅ |
| Conciliação bancária | ❌ | ❌ | ✅ |
| Utilizadores | 1 | 3 | Ilimitados |

- Sem taxa de setup.
- Sem cobrança por transação.
- Pagamento mensal por PIX ou transferência.
- Sem fidelidade.
- Cliente pode mudar de plano a qualquer momento.

---

## 7. Fluxo do cliente

1. Cliente preenche formulário de solicitação (público)
↓

2. Admin analisa e aprova
↓

3. Sistema cria usuário, empresa, assinatura
↓

4. Admin envia credenciais por e-mail/WhatsApp
↓

5. Cliente faz o primeiro login
↓

6. Cliente usa o sistema
↓

7. (Opcional) Cliente cancela ou pede exclusão
↓

8. Admin arquiva empresa (anonimização + retenção fiscal 5 anos)


Detalhes de cada etapa em [`docs/produto/fluxos.md`](fluxos.md).

---

## 8. Conformidade legal

O MeuGestor foi construído desde o início pensando na **LGPD** e nas
obrigações fiscais brasileiras.

### LGPD

- **Base legal** documentada para cada tratamento de dado.
- **Inventário PII** mapeando todos os dados pessoais tratados.
- **Política de Privacidade** pública.
- **Termos de Uso** assinados no cadastro.
- **Exportação de dados** pelo próprio titular (direito de acesso).
- **Exclusão com anonimização** (direito de eliminação).
- **Encarregado de Dados (DPO)** definido.
- **Plano de resposta a incidentes**.

### Obrigações fiscais

- **Retenção de 5 anos** dos dados financeiros após exclusão (CTN
  art. 173 e 174).
- **Anonimização imediata** dos dados pessoais ao arquivar.
- **Trilha de auditoria imutável** das ações críticas.

Documentação completa em [`docs/lgpd/`](../lgpd/00-LEIA-ME.md).

---

## 9. Arquitetura resumida

Para quem quer entender como está montado, sem entrar em detalhes técnicos:

| Camada | Tecnologia |
|--------|------------|
| Interface | React (web) |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Autenticação | Supabase Auth |
| Banco de dados | PostgreSQL (Supabase) |
| Hospedagem | Vercel |
| Segurança | Row Level Security (RLS) |

Detalhes técnicos em [`docs/tecnica/arquitetura.md`](../tecnica/arquitetura.md).

---

## 10. Diferenciais

### Comparado ao caderno

- Soma tudo automaticamente.
- Avisa o que ainda está pendente.
- Mostra o resultado em tempo real.
- Permite exportar os dados.

### Comparado a planilhas

- Não precisa configurar fórmulas.
- Tem categorias padronizadas.
- Tem conciliação bancária integrada.
- Tem dashboard pronto.

### Comparado a ERPs

- Muito mais simples de usar.
- Muito mais barato.
- Foco em pequenos negócios de bairro.
- Sem jargão contábil.

### Comparado a aplicativos genéricos

- Categorias pensadas para o bairro.
- Retenção fiscal implementada.
- Conformidade LGPD.
- Suporte em português.
- Trilha de auditoria.

---

## 11. O que está fora do escopo

Para deixar claro o que o MeuGestor **não** faz:

- Emissão de nota fiscal (NF-e, NFS-e).
- Integração direta com APIs bancárias (Open Finance).
- OCR de imagem ou print de extrato.
- Aplicativo nativo (iOS/Android) — funciona bem no navegador.
- Folha de pagamento.
- Multimoeda.
- Relatórios contábeis formais (balanço, DRE).
- Cobrança automatizada com cartão.
- Programa de indicação.
- Trial gratuito (por enquanto).

---

## 12. Status atual do produto

**Fase:** protótipo funcional, pronto para os primeiros clientes.

| Módulo | Status |
|--------|:---:|
| Autenticação (login, cadastro, recuperação) | ✅ |
| Aprovação de cadastros | ✅ |
| Multiempresa e utilizadores | ✅ |
| Lançamentos com categorias | ✅ |
| Extrato | ✅ |
| Dashboard e gráficos | ✅ |
| Conciliação bancária | ✅ |
| Exportação de dados (LGPD) | ✅ |
| Arquivamento com retenção fiscal | ✅ |
| Documentação LGPD | ✅ |
| Manual do usuário | 🔄 |
| Publicação de Política e Termos no app | ⏳ |
| Job de expurgo automático | ⏳ |

---

## 13. Próximos passos

1. **Fase atual:** fechar manual do usuário e publicar Política/Termos
   no app.
2. **Fase comercial:** iniciar onboarding dos primeiros clientes reais.
3. **Evolução:** avaliar adição de emissão de nota fiscal, relatórios
   contábeis e integração com contador.

---

## 14. Histórico de revisões

| Versão | Data | Alterações | Responsável |
|--------|------|------------|-------------|
| 1.0 | 2026-09-25 | Criação inicial | Jeferson |