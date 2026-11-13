# Coleta de metadados do Supabase

Este roteiro coleta somente metadados do PostgreSQL para comparar o banco ativo com a documentação do Meu Gestor.

**Segurança:** as consultas abaixo são somente leitura. Não cole aqui chaves, tokens, senhas, connection strings, dados de clientes ou resultados de consultas que contenham registros pessoais. Execute no SQL Editor do projeto correto (desenvolvimento ou produção) e compartilhe apenas os resultados de estrutura.

## Antes de executar

1. Abra o painel do Supabase do projeto correspondente ao Meu Gestor.
2. Confirme se está no projeto de desenvolvimento ou produção.
3. Abra **SQL Editor**.
4. Execute cada consulta separadamente.
5. Copie os resultados de metadados para análise. Não execute comandos `ALTER`, `CREATE`, `DROP`, `UPDATE` ou `DELETE`.

## 1. Tabelas e colunas

Lista tabelas e colunas do schema `public`, incluindo tipo, nulabilidade e default.

```sql
SELECT
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

## 2. RLS habilitado por tabela

```sql
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY c.relname;
```

## 3. Policies RLS

Esta consulta retorna comandos/condições das policies. Revise antes de compartilhar para confirmar que não há nomes internos ou informações que prefira manter privadas.

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 4. Constraints e relacionamentos

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_schema = kcu.constraint_schema
 AND tc.constraint_name = kcu.constraint_name
 AND tc.table_name = kcu.table_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_schema = ccu.constraint_schema
 AND tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_schema = cc.constraint_schema
 AND tc.constraint_name = cc.constraint_name
WHERE tc.constraint_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
```

## 5. Índices

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 6. Triggers

```sql
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_orientation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name, event_manipulation;
```

## 7. Funções do schema public

A consulta lista nomes e assinaturas das funções. Não extrai o código-fonte completo.

```sql
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

## 8. Como enviar os resultados

Envie os resultados das consultas 1 a 7, preferencialmente como CSV ou texto copiado do SQL Editor. Se o resultado for extenso, pode enviar em partes.

Não envie:
- `service_role`, chave secreta ou chave publishable/anon;
- senha do banco ou URL de conexão;
- dados reais de usuários, empresas, movimentações ou clientes;
- conteúdo de tabelas de negócio.

## 9. O que será verificado

- Se o schema ativo corresponde às 14 tabelas descritas em `BANCO_DE_DADOS.md`;
- Se todas as tabelas que armazenam dados de empresas têm RLS habilitado;
- Se as policies restringem leitura e escrita à empresa vinculada ao usuário;
- Se permissões por papel (dono, operador e leitor) são aplicadas no banco;
- Se constraints garantem integridade de conciliação e movimentações;
- Se existem triggers de auditoria e proteção contra alterações indevidas;
- Se há índices adequados para consultas frequentes.

**Importante:** habilitar RLS não garante, por si só, isolamento correto. A segurança depende das policies, dos grants, das funções e dos caminhos de acesso utilizados pela aplicação.
