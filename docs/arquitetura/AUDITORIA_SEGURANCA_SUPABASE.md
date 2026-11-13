# Auditoria de segurança do Supabase — Meu Gestor

- **Projeto:** Meu Gestor
- **Ambiente auditado:** projeto Supabase original (produção, somente leitura)
- **Ambiente destinado às correções:** `meu-gestor-dev`
- **Branch documental:** `docs/engenharia-software-scrum`
- **Data da coleta:** 13/11/2026
- **Status:** diagnóstico inicial concluído; correções ainda não aplicadas

> **Limite de segurança:** este documento registra metadados e definições obtidos por consultas somente leitura. Não foram executados testes de exploração, alterações de privilégios, policies, funções ou dados. Os resultados não comprovam, isoladamente, que toda operação apontada seja explorável pela API. O RLS, os privilégios SQL, as permissões de coluna, as funções e os caminhos da aplicação precisam ser avaliados em conjunto.

## 1. Resumo executivo

A coleta no projeto original identificou concessões de privilégios excessivamente amplas para os papéis de aplicação `anon` e `authenticated`, privilégios padrão igualmente amplos para objetos futuros, funções `SECURITY DEFINER` executáveis por papéis de aplicação e uma view sem `security_invoker = true`.

Esses achados justificam tratar a segurança do banco como bloqueador para disponibilização comercial até que as correções sejam implementadas e testadas em ambiente isolado.

**Nenhuma correção deve ser executada diretamente no projeto original nesta etapa.**

## 2. Escopo e evidências

Foram consultados metadados do projeto original:

- 14 tabelas do schema `public`, com colunas, constraints e índices;
- estado de RLS e policies das 14 tabelas;
- 14 funções de negócio do schema `public`, definições e privilégios de execução;
- privilégios efetivos de tabela para `anon`, `authenticated` e `service_role`;
- concessões diretas em tabelas (resultado detalhado recebido parcialmente);
- privilégios padrão (`pg_default_acl`);
- views do schema `public` e opção `security_invoker`;
- triggers não internos.

As tabelas inventariadas são: `assinaturas`, `audit_log`, `conciliacoes`, `contas_bancarias`, `empresa_vendedores`, `empresas`, `movimentacoes`, `pagamentos`, `pedidos_contratacao`, `planos`, `solicitacoes_exclusao`, `transacoes_bancarias`, `user_empresas` e `usuarios`.

## 3. Achados prioritários

### SEC-01 — Privilégios efetivos excessivos nas tabelas

**Severidade proposta:** Crítica / P0 — requer validação e correção prioritária.

A consulta com `has_table_privilege` retornou `true` para todas as sete permissões consultadas — `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` e `TRIGGER` — em todas as 14 tabelas, para `anon`, `authenticated` e `service_role`.

Isso comprova privilégios SQL efetivos amplos para os papéis consultados. Não comprova que toda operação seja acessível por REST nem que qualquer usuário consiga atuar sobre todas as linhas. Policies RLS continuam relevantes para operações por linha, mas não protegem contra `TRUNCATE` da mesma forma que protegem `DELETE`.

Uma consulta separada de `information_schema.table_privileges` confirmou concessões diretas de `INSERT`, `UPDATE` e `DELETE` a `anon` e `authenticated` em sete tabelas: `usuarios`, `user_empresas`, `pedidos_contratacao`, `empresas`, `contas_bancarias`, `transacoes_bancarias` e `conciliacoes`.

A listagem de ACLs diretas foi recebida apenas parcialmente. Nas primeiras tabelas exibidas, as concessões estavam atribuídas por `postgres`; não foi recebida a listagem completa de todas as tabelas. A consulta não mostrou linhas de beneficiário `PUBLIC` no trecho recebido.

**Ação proposta:** mapear as operações reais necessárias por papel e por tabela; revogar concessões excessivas no ambiente de desenvolvimento; conceder somente o mínimo necessário. Não copiar um `REVOKE` genérico para produção sem testes de regressão.

### SEC-02 — Privilégios padrão excessivos para objetos futuros

**Severidade proposta:** Crítica / P0.

O catálogo `pg_default_acl` apresentou entradas para os proprietários `postgres` e `supabase_admin`, no schema `public`:

- `r` (tabelas): concessões amplas a `anon`, `authenticated` e `service_role`, incluindo leitura, escrita, exclusão, truncate, referências, triggers e manutenção;
- `f` (funções): execução concedida a `anon`, `authenticated` e `service_role`;
- `S` (sequências): privilégios de leitura, atualização e uso concedidos aos mesmos papéis.

Essas configurações afetam objetos futuros criados pelo proprietário correspondente; não são, por si só, uma alteração retroativa das permissões de todos os objetos existentes.

**Ação proposta:** revisar e restringir os privilégios padrão para cada proprietário, em especial `postgres` e `supabase_admin`, em ambiente de desenvolvimento. Validar também os privilégios de sequências e funções. Confirmar como o Supabase cria objetos e quais concessões são necessárias para os serviços gerenciados antes de alterar defaults.

### SEC-03 — Funções SECURITY DEFINER executáveis por papéis de aplicação

**Severidade proposta:** Crítica / P0.

Foram inventariadas 14 funções públicas de negócio, todas com `SECURITY DEFINER`. A consulta de privilégios efetivos indicou `EXECUTE = true` para `anon`, `authenticated` e `service_role` em todas elas. A ACL também indicou concessão a `PUBLIC` para as funções examinadas.

Funções com privilégios do proprietário precisam de autorização interna robusta. A concessão de execução não prova que a ação protegida será concluída, mas amplia a superfície de ataque e exige revisão.

Pontos específicos identificados na leitura das definições:

- Algumas verificações usam expressões como `IF role NOT IN (...)` ou booleanos derivados de `auth.uid()`; quando o resultado é `NULL`, uma condição PL/pgSQL pode não bloquear a execução como esperado.
- `handle_new_user` usa metadados de usuário para determinar o papel inicial; papel privilegiado não deve ser confiado a metadados controlados pelo cliente.
- `aprovar_pedido` retorna a senha provisória em texto claro; deve ser substituído por um fluxo seguro de convite ou redefinição.
- `criar_usuario`, `remover_usuario` e `resetar_senha_usuario` precisam de validação rigorosa do chamador, vínculo com a empresa e usuário-alvo.
- `resetar_senha_usuario` deve confirmar que o usuário-alvo pertence à empresa indicada.
- Funções de consulta de autorização também devem ter `search_path` fixo e mínimo privilégio.

**Ação proposta:** revisar uma função por vez, corrigir verificações para falhar de forma fechada, fixar `search_path`, restringir `EXECUTE` por papel e validar o fluxo de autenticação. Não revogar execução de `handle_new_user` sem considerar que ela é chamada por trigger.

### SEC-04 — View `vendedores_com_carteira` sem security invoker

**Severidade proposta:** Alta / P0.

A view `public.vendedores_com_carteira` apresentou `security_invoker = false`, ao contrário das outras três views consultadas:

- `clientes_publicos`: `true`;
- `pagamentos_publicos`: `true`;
- `pedidos_publicos`: `true`.

A view de vendedores consulta nome, e-mail, percentual de comissão e totais de clientes por status. Como usa o contexto do proprietário, pode não aplicar as policies RLS subjacentes no contexto do usuário chamador, dependendo das concessões e da forma de acesso à view.

**Ação proposta:** avaliar se a view precisa ser exposta; habilitar `security_invoker = true` se compatível com o desenho de autorização; revisar grants da própria view e testar acesso como anon, vendedor e administrador.

### SEC-05 — Permissões de colunas sensíveis

**Severidade proposta:** Alta / P0.

A consulta de privilégios por coluna indicou concessões de INSERT/UPDATE a `anon` e `authenticated` para colunas sensíveis, incluindo:

- `usuarios.role`, `usuarios.ativo`, `usuarios.comissao_percentual`;
- `pedidos_contratacao.status`, `pedidos_contratacao.vendedor_id`;
- `empresas.status_acesso`, `empresas.vendedor_id`, `empresas.arquivada_em`, `empresas.expurgo_em`;
- `transacoes_bancarias.conciliado`, `transacoes_bancarias.valor_centavos`;
- `contas_bancarias.ativo`;
- `conciliacoes.status`, `conciliacoes.confirmado_por`, `conciliacoes.confirmado_em`;
- `user_empresas.papel`.

A policy de atualização própria em `usuarios` restringe a linha pelo identificador do usuário, mas não limita por si só quais colunas ele pode atualizar. Grants de coluna e RLS precisam ser avaliados em conjunto.

**Ação proposta:** retirar permissões de alteração de campos privilegiados dos papéis comuns e conceder alterações controladas por função de backend ou operação administrativa validada.

### SEC-06 — Policies de escrita não diferenciam todos os papéis de negócio

**Severidade proposta:** Alta / P0.

As policies observadas incluem escrita em `contas_bancarias` e `transacoes_bancarias` para usuários vinculados à empresa, sem distinção explícita entre `dono`, `operador` e `leitor` na expressão registrada. As policies de `conciliacoes` também usam vínculo com a empresa sem distinção explícita de papel.

**Ação proposta:** definir matriz formal de permissões e aplicar as regras no banco. O papel `leitor` deve ser somente leitura; operador deve receber apenas operações necessárias; dono e administradores devem ter privilégios administrativos delimitados.

### SEC-07 — Integridade de contratação pública e dados administrativos

**Severidade proposta:** Alta / P0.

A policy `pedidos_insert_publico` permite INSERT para `anon` e `authenticated` com `WITH CHECK true`. As permissões de colunas observadas incluem campos administrativos como `status` e `vendedor_id`.

**Ação proposta:** limitar o INSERT público aos campos necessários para solicitar contratação, aplicar validação no servidor e impedir que o cliente determine status, vendedor ou dados de aprovação. UPDATE e DELETE devem permanecer em caminhos administrativos autorizados.

### SEC-08 — Auditoria e retenção

**Severidade proposta:** Alta / P1.

A tabela `audit_log` tem permissões efetivas amplas na consulta de privilégios, embora suas policies observadas restrinjam operações por vínculo/admin. O código frontend registra eventos após operações de negócio e trata falhas de auditoria sem necessariamente reverter a operação principal.

**Ação proposta:** proteger a tabela contra alteração/exclusão por papéis comuns; registrar eventos críticos no banco ou em função transacional confiável; definir retenção e acesso mínimo.

## 4. Matriz de políticas RLS observadas

Todas as 14 tabelas estavam com RLS habilitado e `FORCE ROW LEVEL SECURITY = false`. O RLS habilitado é uma camada positiva, mas não neutraliza grants excessivos nem privilégios de proprietário ou service role.

A coleta registrou, entre outros, estes pontos para validação:

- `usuarios_update_proprio`: restringe a linha própria, mas não as colunas sensíveis;
- `pedidos_insert_publico`: INSERT público com `WITH CHECK true`;
- `cb_write` e `tb_write`: escrita para usuário vinculado, sem distinção explícita de papel na policy observada;
- policies de `conciliacoes`: vínculo com empresa, sem distinção explícita de papel;
- `vendedores_com_carteira`: view sem `security_invoker`.

Não se deve interpretar `with_check = NULL` isoladamente como ausência de proteção em policy UPDATE: a semântica de policies PostgreSQL deve ser considerada, inclusive o uso de `USING` como verificação padrão quando aplicável.

## 5. Plano de correção no ambiente de desenvolvimento

### Etapa 0 — Preparação

1. Manter o projeto original somente para leitura.
2. Confirmar que `meu-gestor-dev` é o projeto de destino.
3. Criar backup/exportação segura antes de reproduzir a estrutura.
4. Obter schema, funções, views, triggers, grants e policies do projeto original, sem dados pessoais ou financeiros reais.
5. Versionar migrations e registrar o estado inicial.

### Etapa 1 — Privilégios

1. Definir matriz de operações por tabela e papel.
2. Corrigir default privileges para tabelas, sequências e funções.
3. Revogar grants desnecessários de `anon` e `authenticated`.
4. Conceder somente SELECT/INSERT/UPDATE/DELETE estritamente necessários.
5. Não conceder `TRUNCATE`, `TRIGGER`, `MAINTAIN` ou `REFERENCES` aos papéis de aplicação sem justificativa específica.
6. Testar operações normais da aplicação após cada mudança.

### Etapa 2 — Funções e autenticação

1. Corrigir autorização para falhar de forma fechada quando não houver usuário autenticado.
2. Definir `search_path` explicitamente.
3. Restringir `EXECUTE` e remover concessões desnecessárias a `PUBLIC`/anon.
4. Revisar criação de usuários, aprovação de contratação, remoção e redefinição de senha.
5. Remover retorno de senha em texto claro e adotar convite/redefinição segura.
6. Impedir promoção de privilégios por metadados controlados pelo cliente.

### Etapa 3 — RLS, colunas e views

1. Testar isolamento entre pelo menos duas empresas.
2. Testar cada papel: anon, dono, operador, leitor, vendedor e administrador.
3. Limitar atualização de campos privilegiados.
4. Corrigir policies de contas bancárias, transações, conciliações, usuários e pedidos.
5. Revisar grants das views e habilitar security invoker onde apropriado.
6. Proteger auditoria contra alteração indevida.

### Etapa 4 — Critérios de aceite

A correção só será considerada validada quando:

- Usuário anônimo não acessar dados internos nem executar operações administrativas;
- usuário autenticado não acessar dados de outra empresa;
- leitor não conseguir inserir, atualizar ou excluir registros;
- operador não alterar papéis, comissão, status administrativo ou vínculos;
- vendedor acessar somente a carteira autorizada;
- administrador executar apenas operações previstas e auditadas;
- funções privilegiadas recusarem chamadas sem autorização;
- views respeitarem o contexto de segurança pretendido;
- fluxos de login, contratação, movimentação, conciliação, pagamento e arquivamento continuarem funcionando;
- nenhuma chave privilegiada estiver exposta no frontend.

## 6. Restrições de execução

- Não executar correções no projeto original durante esta etapa.
- Não publicar deploy.
- Não alterar a branch `main`.
- Não usar dados reais de clientes no ambiente de desenvolvimento.
- Não compartilhar senhas, tokens, chaves secretas ou connection strings.
- Todas as alterações de banco devem ser versionadas em migrations e testadas no projeto `meu-gestor-dev`.
- A implantação em produção depende de revisão, backup, plano de reversão e autorização expressa.

## 7. Conclusão

A auditoria inicial encontrou configuração de privilégios excessivamente ampla, defaults inseguros para objetos futuros, execução pública de funções privilegiadas e uma view que não usa o contexto do chamador. O RLS está habilitado nas tabelas, mas isso não é suficiente para declarar o banco seguro.

O diagnóstico inicial está concluído para fins de planejamento. A próxima fase é reconstruir/versionar a estrutura no ambiente isolado e corrigir os achados por etapas, com testes positivos e negativos. A segurança do sistema só poderá ser reavaliada após evidências de execução dos testes no ambiente de desenvolvimento.
