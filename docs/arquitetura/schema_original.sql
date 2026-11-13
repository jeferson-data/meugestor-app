


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."alterar_comissao_vendedor"("p_usuario_id" "uuid", "p_comissao" numeric) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    IF NOT public.e_admin_ou_dono_programa() THEN
        RAISE EXCEPTION 'Sem permissão para alterar comissões.';
    END IF;

    IF p_comissao < 0 OR p_comissao > 100 THEN
        RAISE EXCEPTION 'A comissão deve estar entre 0 e 100.';
    END IF;

    UPDATE public.usuarios
    SET comissao_percentual = p_comissao
    WHERE id = p_usuario_id AND role = 'vendedor';
END;
$$;


ALTER FUNCTION "public"."alterar_comissao_vendedor"("p_usuario_id" "uuid", "p_comissao" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."alterar_plano_empresa"("p_empresa_id" "uuid", "p_novo_plano_id" "uuid") RETURNS TABLE("out_empresa_id" "uuid", "out_plano_nome" "text", "out_valor_centavos" integer, "out_fim_contrato" "date")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    v_novo_plano RECORD;
    v_user_role TEXT;
BEGIN
    -- 1. Só admin/dono_programa podem alterar planos
    SELECT role INTO v_user_role
    FROM public.usuarios WHERE id = auth.uid();

    IF v_user_role NOT IN ('admin_programa', 'dono_programa') THEN
        RAISE EXCEPTION 'Sem permissão para alterar planos.';
    END IF;

    -- 2. Confirmar que a empresa existe
    IF NOT EXISTS (
        SELECT 1 FROM public.empresas WHERE id = p_empresa_id
    ) THEN
        RAISE EXCEPTION 'Empresa não encontrada.';
    END IF;

    -- 3. Buscar o novo plano
    SELECT id, nome, valor_centavos INTO v_novo_plano
    FROM public.planos
    WHERE id = p_novo_plano_id AND ativo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plano não encontrado ou inativo.';
    END IF;

    -- 4. Cancelar assinatura atual (mantém histórico)
    UPDATE public.assinaturas
    SET status = 'cancelado'
    WHERE empresa_id = p_empresa_id
      AND status = 'ativo';

    -- 5. Criar nova assinatura
    INSERT INTO public.assinaturas (
        empresa_id, plano_id, inicio_contrato, fim_contrato,
        valor_centavos, status
    )
    VALUES (
        p_empresa_id,
        p_novo_plano.id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        v_novo_plano.valor_centavos,
        'ativo'
    );

    -- 6. Audit log
    INSERT INTO public.audit_log (empresa_id, usuario_id, usuario_nome, acao)
    SELECT
        p_empresa_id,
        auth.uid(),
        u.nome,
        'Alterou o plano para ' || v_novo_plano.nome
    FROM public.usuarios u WHERE u.id = auth.uid();

    -- 7. Devolver dados
    RETURN QUERY
    SELECT
        p_empresa_id,
        v_novo_plano.nome,
        v_novo_plano.valor_centavos,
        (CURRENT_DATE + INTERVAL '30 days')::date;
END;
$$;


ALTER FUNCTION "public"."alterar_plano_empresa"("p_empresa_id" "uuid", "p_novo_plano_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."aprovar_pedido"("p_pedido_id" "uuid", "p_senha_provisoria" "text", "p_marco_pago" boolean DEFAULT true) RETURNS TABLE("out_empresa_id" "uuid", "out_empresa_nome" "text", "out_dono_nome" "text", "out_dono_email" "text", "out_senha_provisoria" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth', 'extensions'
    AS $$
DECLARE
    v_pedido RECORD;
    v_plano_id UUID;
    v_plano_valor INT;
    v_empresa_id UUID;
    v_user_id UUID;
    v_mes_ref DATE;
    v_op_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
          AND role IN ('admin_programa', 'dono_programa')
    ) THEN
        RAISE EXCEPTION 'Sem permissão para aprovar pedidos.';
    END IF;

    SELECT * INTO v_pedido
    FROM public.pedidos_contratacao
    WHERE id = p_pedido_id AND status = 'pendente';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido não encontrado ou já processado.';
    END IF;

    SELECT id, valor_centavos INTO v_plano_id, v_plano_valor
    FROM public.planos
    WHERE nome = v_pedido.plano_solicitado AND ativo = TRUE
    LIMIT 1;

    IF v_plano_id IS NULL THEN
        SELECT id, valor_centavos INTO v_plano_id, v_plano_valor
        FROM public.planos WHERE nome = 'Padrão' LIMIT 1;
    END IF;

    -- Criar empresa
    INSERT INTO public.empresas (nome, cnpj, telefone, email, endereco)
    VALUES (
        v_pedido.nome_empresa,
        v_pedido.cnpj,
        v_pedido.telefone_empresa,
        v_pedido.email_empresa,
        v_pedido.endereco
    )
    RETURNING public.empresas.id INTO v_empresa_id;

    -- Criar assinatura
    INSERT INTO public.assinaturas (
        empresa_id, plano_id, inicio_contrato, fim_contrato,
        valor_centavos, status
    )
    VALUES (
        v_empresa_id, v_plano_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
        v_plano_valor, 'ativo'
    );

    -- Criar pagamento inicial
    v_mes_ref := DATE_TRUNC('month', CURRENT_DATE)::date;

    INSERT INTO public.pagamentos (
        empresa_id, mes_referencia, valor_centavos,
        status, data_pagamento, registrado_por
    )
    VALUES (
        v_empresa_id, v_mes_ref, v_plano_valor,
        CASE WHEN p_marco_pago THEN 'pago' ELSE 'pendente' END,
        CASE WHEN p_marco_pago THEN CURRENT_DATE ELSE NULL END,
        auth.uid()
    );

    -- Criar dono
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_pedido.email_responsavel;

    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, role, aud,
            confirmation_token, recovery_token, email_change_token_new, email_change
        )
        VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            v_pedido.email_responsavel,
            extensions.crypt(p_senha_provisoria, extensions.gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nome', v_pedido.nome_responsavel, 'role', 'dono_cliente'),
            NOW(), NOW(),
            'authenticated', 'authenticated',
            '', '', '', ''
        )
        RETURNING id INTO v_user_id;

        UPDATE public.usuarios
        SET telefone = v_pedido.telefone_responsavel
        WHERE id = v_user_id;
    END IF;

    INSERT INTO public.user_empresas (usuario_id, empresa_id, papel)
    VALUES (v_user_id, v_empresa_id, 'dono')
    ON CONFLICT (usuario_id, empresa_id) DO NOTHING;

    -- Operador (opcional)
    IF v_pedido.nome_operador IS NOT NULL
       AND v_pedido.email_operador IS NOT NULL
       AND length(trim(v_pedido.email_operador)) > 0 THEN

        SELECT id INTO v_op_id FROM auth.users WHERE email = v_pedido.email_operador;

        IF v_op_id IS NULL THEN
            INSERT INTO auth.users (
                id, instance_id, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at, role, aud,
                confirmation_token, recovery_token, email_change_token_new, email_change
            )
            VALUES (
                gen_random_uuid(),
                '00000000-0000-0000-0000-000000000000',
                v_pedido.email_operador,
                extensions.crypt(p_senha_provisoria, extensions.gen_salt('bf')),
                NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                jsonb_build_object('nome', v_pedido.nome_operador, 'role', 'dono_cliente'),
                NOW(), NOW(),
                'authenticated', 'authenticated',
                '', '', '', ''
            )
            RETURNING id INTO v_op_id;

            UPDATE public.usuarios
            SET telefone = v_pedido.telefone_operador
            WHERE id = v_op_id;
        END IF;

        INSERT INTO public.user_empresas (usuario_id, empresa_id, papel)
        VALUES (v_op_id, v_empresa_id, 'operador')
        ON CONFLICT (usuario_id, empresa_id) DO NOTHING;
    END IF;

    -- Marcar pedido como aprovado
    UPDATE public.pedidos_contratacao
    SET status = 'aprovado'
    WHERE id = p_pedido_id;

    -- Audit log
    INSERT INTO public.audit_log (empresa_id, usuario_id, usuario_nome, acao)
    SELECT v_empresa_id, auth.uid(), u.nome, 'Aprovou pedido de contratação'
    FROM public.usuarios u WHERE u.id = auth.uid();

    -- Retornar dados
    RETURN QUERY
    SELECT
        v_empresa_id,
        v_pedido.nome_empresa::TEXT,
        v_pedido.nome_responsavel::TEXT,
        v_pedido.email_responsavel::TEXT,
        p_senha_provisoria;
END;
$$;


ALTER FUNCTION "public"."aprovar_pedido"("p_pedido_id" "uuid", "p_senha_provisoria" "text", "p_marco_pago" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."criar_usuario"("p_nome" "text", "p_email" "text", "p_senha" "text", "p_telefone" "text", "p_empresa_id" "uuid", "p_papel" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    v_user_id UUID;
    v_caller_role TEXT;
    v_is_admin BOOLEAN;
    v_is_dono_empresa BOOLEAN;
BEGIN
    SELECT role INTO v_caller_role FROM public.usuarios WHERE id = auth.uid();
    v_is_admin := v_caller_role IN ('admin_programa', 'dono_programa');

    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid()
          AND empresa_id = p_empresa_id
          AND papel = 'dono'
    ) INTO v_is_dono_empresa;

    IF NOT v_is_admin AND NOT v_is_dono_empresa THEN
        RAISE EXCEPTION 'Sem permissão para criar utilizadores nesta empresa.';
    END IF;

    IF NOT v_is_admin AND p_papel NOT IN ('operador', 'leitor') THEN
        RAISE EXCEPTION 'Só pode criar operadores ou leitores.';
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'Já existe um utilizador com este e-mail.';
    END IF;

    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, role, aud,
        confirmation_token, recovery_token, email_change_token_new, email_change
    )
    VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_senha, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nome', p_nome, 'role', 'dono_cliente'),
        NOW(), NOW(),
        'authenticated', 'authenticated',
        '', '', '', ''
    )
    RETURNING id INTO v_user_id;

    UPDATE public.usuarios
    SET role = 'dono_cliente', telefone = p_telefone
    WHERE id = v_user_id;

    INSERT INTO public.user_empresas (usuario_id, empresa_id, papel)
    VALUES (v_user_id, p_empresa_id, p_papel)
    ON CONFLICT (usuario_id, empresa_id) DO NOTHING;

    RETURN v_user_id;
END;
$$;


ALTER FUNCTION "public"."criar_usuario"("p_nome" "text", "p_email" "text", "p_senha" "text", "p_telefone" "text", "p_empresa_id" "uuid", "p_papel" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_admin_ou_dono_programa"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
          AND role IN ('admin_programa', 'dono_programa')
    );
$$;


ALTER FUNCTION "public"."e_admin_ou_dono_programa"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_admin_programa"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND role = 'admin_programa'
    );
$$;


ALTER FUNCTION "public"."e_admin_programa"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_dono_da_empresa"("emp_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid()
          AND empresa_id = emp_id
          AND papel = 'dono'
    );
$$;


ALTER FUNCTION "public"."e_dono_da_empresa"("emp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_vendedor"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND role = 'vendedor'
    );
$$;


ALTER FUNCTION "public"."e_vendedor"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_vendedor_da_empresa"("emp_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.empresas
        WHERE id = emp_id AND vendedor_id = auth.uid()
    );
$$;


ALTER FUNCTION "public"."e_vendedor_da_empresa"("emp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."e_vinculado"("emp_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid() AND empresa_id = emp_id
    );
$$;


ALTER FUNCTION "public"."e_vinculado"("emp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO public.usuarios (id, nome, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'dono_cliente')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."pode_lancar"("emp_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid()
          AND empresa_id = emp_id
          AND papel IN ('dono', 'operador')
    );
$$;


ALTER FUNCTION "public"."pode_lancar"("emp_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remover_usuario"("p_usuario_id" "uuid", "p_empresa_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    v_caller_role TEXT;
    v_is_admin BOOLEAN;
    v_is_dono_empresa BOOLEAN;
    v_outros_vinculos INT;
BEGIN
    SELECT role INTO v_caller_role FROM public.usuarios WHERE id = auth.uid();
    v_is_admin := v_caller_role IN ('admin_programa', 'dono_programa');

    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid()
          AND empresa_id = p_empresa_id
          AND papel = 'dono'
    ) INTO v_is_dono_empresa;

    IF NOT v_is_admin AND NOT v_is_dono_empresa THEN
        RAISE EXCEPTION 'Sem permissão para remover este utilizador.';
    END IF;

    -- Remover vínculo com a empresa
    DELETE FROM public.user_empresas
    WHERE usuario_id = p_usuario_id AND empresa_id = p_empresa_id;

    -- Se não tiver mais vínculos, apagar o perfil e a conta
    SELECT COUNT(*) INTO v_outros_vinculos
    FROM public.user_empresas
    WHERE usuario_id = p_usuario_id;

    IF v_outros_vinculos = 0 THEN
        DELETE FROM public.usuarios WHERE id = p_usuario_id;
        DELETE FROM auth.users WHERE id = p_usuario_id;
    END IF;
END;
$$;


ALTER FUNCTION "public"."remover_usuario"("p_usuario_id" "uuid", "p_empresa_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resetar_senha_usuario"("p_usuario_id" "uuid", "p_nova_senha" "text", "p_empresa_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    v_caller_role TEXT;
    v_is_admin BOOLEAN;
    v_is_dono_empresa BOOLEAN;
BEGIN
    IF length(p_nova_senha) < 6 THEN
        RAISE EXCEPTION 'A senha deve ter pelo menos 6 caracteres.';
    END IF;

    SELECT role INTO v_caller_role FROM public.usuarios WHERE id = auth.uid();
    v_is_admin := v_caller_role IN ('admin_programa', 'dono_programa');

    SELECT EXISTS (
        SELECT 1 FROM public.user_empresas
        WHERE usuario_id = auth.uid()
          AND empresa_id = p_empresa_id
          AND papel = 'dono'
    ) INTO v_is_dono_empresa;

    IF NOT v_is_admin AND NOT v_is_dono_empresa THEN
        RAISE EXCEPTION 'Sem permissão para alterar esta senha.';
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(p_nova_senha, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_usuario_id;
END;
$$;


ALTER FUNCTION "public"."resetar_senha_usuario"("p_usuario_id" "uuid", "p_nova_senha" "text", "p_empresa_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assinaturas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "plano_id" "uuid" NOT NULL,
    "inicio_contrato" "date" DEFAULT CURRENT_DATE NOT NULL,
    "fim_contrato" "date" NOT NULL,
    "valor_centavos" integer NOT NULL,
    "status" "text" DEFAULT 'ativo'::"text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assinaturas_status_check" CHECK (("status" = ANY (ARRAY['ativo'::"text", 'suspenso'::"text", 'cancelado'::"text"]))),
    CONSTRAINT "assinaturas_valor_centavos_check" CHECK (("valor_centavos" > 0))
);


ALTER TABLE "public"."assinaturas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid",
    "usuario_id" "uuid",
    "usuario_nome" "text",
    "acao" "text" NOT NULL,
    "quando" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "cnpj" "text",
    "telefone" "text",
    "email" "text",
    "endereco" "text",
    "status_acesso" "text" DEFAULT 'ativo'::"text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "nome_fantasia" "text",
    "vendedor_id" "uuid",
    "arquivada_em" timestamp with time zone,
    "expurgo_em" timestamp with time zone,
    "motivo_exclusao" "text",
    CONSTRAINT "empresas_status_acesso_check" CHECK (("status_acesso" = ANY (ARRAY['ativo'::"text", 'suspenso'::"text", 'arquivada'::"text"])))
);


ALTER TABLE "public"."empresas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text",
    "valor_centavos" integer NOT NULL,
    "recursos" "jsonb" DEFAULT '{}'::"jsonb",
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "planos_valor_centavos_check" CHECK (("valor_centavos" > 0))
);


ALTER TABLE "public"."planos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."clientes_publicos" WITH ("security_invoker"='on') AS
 SELECT "id",
    "nome",
    "nome_fantasia",
    "cnpj",
    "telefone",
    "email",
    "endereco",
    "status_acesso",
    "criado_em",
    ( SELECT "p"."nome"
           FROM ("public"."assinaturas" "a"
             JOIN "public"."planos" "p" ON (("p"."id" = "a"."plano_id")))
          WHERE (("a"."empresa_id" = "e"."id") AND ("a"."status" = 'ativo'::"text"))
          ORDER BY "a"."criado_em" DESC
         LIMIT 1) AS "plano_ativo",
    ( SELECT "a"."valor_centavos"
           FROM "public"."assinaturas" "a"
          WHERE (("a"."empresa_id" = "e"."id") AND ("a"."status" = 'ativo'::"text"))
          ORDER BY "a"."criado_em" DESC
         LIMIT 1) AS "valor_mensal_centavos",
    ( SELECT "a"."fim_contrato"
           FROM "public"."assinaturas" "a"
          WHERE (("a"."empresa_id" = "e"."id") AND ("a"."status" = 'ativo'::"text"))
          ORDER BY "a"."criado_em" DESC
         LIMIT 1) AS "fim_contrato"
   FROM "public"."empresas" "e";


ALTER VIEW "public"."clientes_publicos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conciliacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "movimentacao_id" "uuid" NOT NULL,
    "data_arquivo" "date" NOT NULL,
    "descricao_arquivo" "text" NOT NULL,
    "valor_centavos" bigint NOT NULL,
    "status" "text" NOT NULL,
    "confirmado_por" "text",
    "confirmado_em" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conciliacoes_status_check" CHECK (("status" = ANY (ARRAY['conciliado'::"text", 'rejeitado'::"text"])))
);


ALTER TABLE "public"."conciliacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contas_bancarias" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "banco" "text" NOT NULL,
    "agencia" "text",
    "numero_conta" "text",
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contas_bancarias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."empresa_vendedores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "vendedor_id" "uuid" NOT NULL,
    "ativo" boolean DEFAULT true,
    "principal" boolean DEFAULT false,
    "criado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."empresa_vendedores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."movimentacoes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "tipo" "text" NOT NULL,
    "categoria" "text",
    "descricao" "text",
    "valor_centavos" integer NOT NULL,
    "data" "date" DEFAULT CURRENT_DATE NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "lancado_por" "text",
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "retida_ate" timestamp with time zone,
    CONSTRAINT "movimentacoes_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'pago'::"text"]))),
    CONSTRAINT "movimentacoes_tipo_check" CHECK (("tipo" = ANY (ARRAY['receita'::"text", 'despesa'::"text"]))),
    CONSTRAINT "movimentacoes_valor_centavos_check" CHECK (("valor_centavos" > 0))
);


ALTER TABLE "public"."movimentacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pagamentos" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "mes_referencia" "date" NOT NULL,
    "valor_centavos" integer NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "data_pagamento" "date",
    "registrado_por" "uuid",
    "observacao" "text",
    "criado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "pagamentos_status_check" CHECK (("status" = ANY (ARRAY['pago'::"text", 'pendente'::"text", 'atrasado'::"text"]))),
    CONSTRAINT "pagamentos_valor_centavos_check" CHECK (("valor_centavos" > 0))
);


ALTER TABLE "public"."pagamentos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pagamentos_publicos" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."empresa_id",
    "e"."nome" AS "nome_empresa",
    "p"."mes_referencia",
    "p"."valor_centavos",
    "p"."status",
    "p"."data_pagamento",
    "p"."criado_em"
   FROM ("public"."pagamentos" "p"
     JOIN "public"."empresas" "e" ON (("e"."id" = "p"."empresa_id")));


ALTER VIEW "public"."pagamentos_publicos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pedidos_contratacao" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nome_empresa" "text" NOT NULL,
    "nome_fantasia" "text",
    "cnpj" "text",
    "segmento" "text",
    "telefone_empresa" "text",
    "email_empresa" "text",
    "endereco" "text",
    "nome_responsavel" "text" NOT NULL,
    "email_responsavel" "text" NOT NULL,
    "telefone_responsavel" "text",
    "plano_solicitado" "text",
    "dia_vencimento" integer,
    "forma_pagamento" "text",
    "nome_operador" "text",
    "email_operador" "text",
    "telefone_operador" "text",
    "observacoes" "text",
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "vendedor_id" "uuid",
    CONSTRAINT "pedidos_contratacao_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'aprovado'::"text", 'rejeitado'::"text"])))
);


ALTER TABLE "public"."pedidos_contratacao" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pedidos_publicos" WITH ("security_invoker"='on') AS
 SELECT "id",
    "nome_empresa",
    "nome_fantasia",
    "cnpj",
    "segmento",
    "telefone_empresa",
    "email_empresa",
    "nome_responsavel",
    "email_responsavel",
    "telefone_responsavel",
    "plano_solicitado",
    "dia_vencimento",
    "forma_pagamento",
    "status",
    "criado_em"
   FROM "public"."pedidos_contratacao";


ALTER VIEW "public"."pedidos_publicos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."solicitacoes_exclusao" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empresa_id" "uuid",
    "empresa_nome" "text",
    "usuario_id" "uuid",
    "usuario_nome" "text",
    "motivo" "text",
    "arquivada_em" timestamp with time zone DEFAULT "now"(),
    "expurgo_em" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'arquivada'::"text" NOT NULL,
    "observacoes" "text",
    CONSTRAINT "solicitacoes_exclusao_status_check" CHECK (("status" = ANY (ARRAY['arquivada'::"text", 'expurgada'::"text"])))
);


ALTER TABLE "public"."solicitacoes_exclusao" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transacoes_bancarias" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "conta_id" "uuid",
    "data" "date" NOT NULL,
    "descricao" "text",
    "valor_centavos" integer NOT NULL,
    "conciliado" boolean DEFAULT false,
    "movimentacao_id" "uuid",
    "criado_em" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."transacoes_bancarias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_empresas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "empresa_id" "uuid" NOT NULL,
    "papel" "text" DEFAULT 'dono'::"text" NOT NULL,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_empresas_papel_check" CHECK (("papel" = ANY (ARRAY['dono'::"text", 'operador'::"text", 'leitor'::"text"])))
);


ALTER TABLE "public"."user_empresas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "telefone" "text",
    "role" "text" DEFAULT 'dono_cliente'::"text" NOT NULL,
    "ativo" boolean DEFAULT true,
    "criado_em" timestamp with time zone DEFAULT "now"(),
    "comissao_percentual" numeric(5,2) DEFAULT 20.00,
    "anonimizado_em" timestamp with time zone,
    "motivo_exclusao" "text",
    CONSTRAINT "usuarios_role_check" CHECK (("role" = ANY (ARRAY['admin_programa'::"text", 'dono_programa'::"text", 'vendedor'::"text", 'dono_cliente'::"text"])))
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vendedores_com_carteira" AS
 SELECT "u"."id" AS "vendedor_id",
    "u"."nome" AS "vendedor_nome",
    "u"."email" AS "vendedor_email",
    "u"."comissao_percentual",
    "count"("e"."id") AS "total_clientes",
    "count"("e"."id") FILTER (WHERE ("e"."status_acesso" = 'ativo'::"text")) AS "clientes_ativos",
    "count"("e"."id") FILTER (WHERE ("e"."status_acesso" = 'suspenso'::"text")) AS "clientes_suspensos"
   FROM ("public"."usuarios" "u"
     LEFT JOIN "public"."empresas" "e" ON (("e"."vendedor_id" = "u"."id")))
  WHERE ("u"."role" = 'vendedor'::"text")
  GROUP BY "u"."id", "u"."nome", "u"."email", "u"."comissao_percentual";


ALTER VIEW "public"."vendedores_com_carteira" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assinaturas"
    ADD CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conciliacoes"
    ADD CONSTRAINT "conciliacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contas_bancarias"
    ADD CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresa_vendedores"
    ADD CONSTRAINT "empresa_vendedores_empresa_id_vendedor_id_key" UNIQUE ("empresa_id", "vendedor_id");



ALTER TABLE ONLY "public"."empresa_vendedores"
    ADD CONSTRAINT "empresa_vendedores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movimentacoes"
    ADD CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pagamentos"
    ADD CONSTRAINT "pagamentos_empresa_id_mes_referencia_key" UNIQUE ("empresa_id", "mes_referencia");



ALTER TABLE ONLY "public"."pagamentos"
    ADD CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pedidos_contratacao"
    ADD CONSTRAINT "pedidos_contratacao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planos"
    ADD CONSTRAINT "planos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."solicitacoes_exclusao"
    ADD CONSTRAINT "solicitacoes_exclusao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transacoes_bancarias"
    ADD CONSTRAINT "transacoes_bancarias_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_empresas"
    ADD CONSTRAINT "user_empresas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_empresas"
    ADD CONSTRAINT "user_empresas_usuario_id_empresa_id_key" UNIQUE ("usuario_id", "empresa_id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_assin_empresa" ON "public"."assinaturas" USING "btree" ("empresa_id");



CREATE INDEX "idx_assin_status" ON "public"."assinaturas" USING "btree" ("status");



CREATE INDEX "idx_cb_empresa" ON "public"."contas_bancarias" USING "btree" ("empresa_id");



CREATE INDEX "idx_conciliacoes_empresa" ON "public"."conciliacoes" USING "btree" ("empresa_id");



CREATE INDEX "idx_conciliacoes_movimentacao" ON "public"."conciliacoes" USING "btree" ("movimentacao_id");



CREATE UNIQUE INDEX "idx_conciliacoes_unica" ON "public"."conciliacoes" USING "btree" ("movimentacao_id") WHERE ("status" = 'conciliado'::"text");



CREATE INDEX "idx_empresas_expurgo" ON "public"."empresas" USING "btree" ("expurgo_em") WHERE ("status_acesso" = 'arquivada'::"text");



CREATE INDEX "idx_empresas_vendedor" ON "public"."empresas" USING "btree" ("vendedor_id");



CREATE INDEX "idx_ev_empresa" ON "public"."empresa_vendedores" USING "btree" ("empresa_id");



CREATE INDEX "idx_ev_vendedor" ON "public"."empresa_vendedores" USING "btree" ("vendedor_id");



CREATE INDEX "idx_log_empresa" ON "public"."audit_log" USING "btree" ("empresa_id");



CREATE INDEX "idx_log_quando" ON "public"."audit_log" USING "btree" ("quando" DESC);



CREATE INDEX "idx_mov_data" ON "public"."movimentacoes" USING "btree" ("data" DESC);



CREATE INDEX "idx_mov_empresa" ON "public"."movimentacoes" USING "btree" ("empresa_id");



CREATE INDEX "idx_mov_status" ON "public"."movimentacoes" USING "btree" ("status");



CREATE INDEX "idx_pag_empresa" ON "public"."pagamentos" USING "btree" ("empresa_id");



CREATE INDEX "idx_pag_mes" ON "public"."pagamentos" USING "btree" ("mes_referencia" DESC);



CREATE INDEX "idx_pedidos_vendedor" ON "public"."pedidos_contratacao" USING "btree" ("vendedor_id");



CREATE INDEX "idx_solicitacoes_empresa" ON "public"."solicitacoes_exclusao" USING "btree" ("empresa_id");



CREATE INDEX "idx_solicitacoes_status" ON "public"."solicitacoes_exclusao" USING "btree" ("status");



CREATE INDEX "idx_tb_conc" ON "public"."transacoes_bancarias" USING "btree" ("conciliado");



CREATE INDEX "idx_tb_empresa" ON "public"."transacoes_bancarias" USING "btree" ("empresa_id");



ALTER TABLE ONLY "public"."assinaturas"
    ADD CONSTRAINT "assinaturas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assinaturas"
    ADD CONSTRAINT "assinaturas_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "public"."planos"("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conciliacoes"
    ADD CONSTRAINT "conciliacoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conciliacoes"
    ADD CONSTRAINT "conciliacoes_movimentacao_id_fkey" FOREIGN KEY ("movimentacao_id") REFERENCES "public"."movimentacoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contas_bancarias"
    ADD CONSTRAINT "contas_bancarias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_vendedores"
    ADD CONSTRAINT "empresa_vendedores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresa_vendedores"
    ADD CONSTRAINT "empresa_vendedores_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empresas"
    ADD CONSTRAINT "empresas_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."movimentacoes"
    ADD CONSTRAINT "movimentacoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pagamentos"
    ADD CONSTRAINT "pagamentos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pagamentos"
    ADD CONSTRAINT "pagamentos_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pedidos_contratacao"
    ADD CONSTRAINT "pedidos_contratacao_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transacoes_bancarias"
    ADD CONSTRAINT "transacoes_bancarias_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transacoes_bancarias"
    ADD CONSTRAINT "transacoes_bancarias_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transacoes_bancarias"
    ADD CONSTRAINT "transacoes_bancarias_movimentacao_id_fkey" FOREIGN KEY ("movimentacao_id") REFERENCES "public"."movimentacoes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_empresas"
    ADD CONSTRAINT "user_empresas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_empresas"
    ADD CONSTRAINT "user_empresas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "assin_admin" ON "public"."assinaturas" TO "authenticated" USING ("public"."e_admin_ou_dono_programa"()) WITH CHECK ("public"."e_admin_ou_dono_programa"());



CREATE POLICY "assin_select" ON "public"."assinaturas" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id") OR "public"."e_vendedor_da_empresa"("empresa_id")));



ALTER TABLE "public"."assinaturas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cb_select" ON "public"."contas_bancarias" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id")));



CREATE POLICY "cb_write" ON "public"."contas_bancarias" TO "authenticated" USING ("public"."e_vinculado"("empresa_id")) WITH CHECK ("public"."e_vinculado"("empresa_id"));



ALTER TABLE "public"."conciliacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conciliacoes_delete" ON "public"."conciliacoes" FOR DELETE USING (("empresa_id" IN ( SELECT "user_empresas"."empresa_id"
   FROM "public"."user_empresas"
  WHERE ("user_empresas"."usuario_id" = "auth"."uid"()))));



CREATE POLICY "conciliacoes_insert" ON "public"."conciliacoes" FOR INSERT WITH CHECK (("empresa_id" IN ( SELECT "user_empresas"."empresa_id"
   FROM "public"."user_empresas"
  WHERE ("user_empresas"."usuario_id" = "auth"."uid"()))));



CREATE POLICY "conciliacoes_select" ON "public"."conciliacoes" FOR SELECT USING (("empresa_id" IN ( SELECT "user_empresas"."empresa_id"
   FROM "public"."user_empresas"
  WHERE ("user_empresas"."usuario_id" = "auth"."uid"()))));



CREATE POLICY "conciliacoes_update" ON "public"."conciliacoes" FOR UPDATE USING (("empresa_id" IN ( SELECT "user_empresas"."empresa_id"
   FROM "public"."user_empresas"
  WHERE ("user_empresas"."usuario_id" = "auth"."uid"()))));



ALTER TABLE "public"."contas_bancarias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."empresa_vendedores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."empresas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "empresas_admin_all" ON "public"."empresas" TO "authenticated" USING ("public"."e_admin_ou_dono_programa"()) WITH CHECK ("public"."e_admin_ou_dono_programa"());



CREATE POLICY "empresas_select" ON "public"."empresas" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("id") OR "public"."e_vendedor_da_empresa"("id")));



CREATE POLICY "empresas_vendedor_update" ON "public"."empresas" FOR UPDATE TO "authenticated" USING ("public"."e_vendedor_da_empresa"("id")) WITH CHECK ("public"."e_vendedor_da_empresa"("id"));



CREATE POLICY "log_insert" ON "public"."audit_log" FOR INSERT TO "authenticated" WITH CHECK (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id")));



CREATE POLICY "log_select" ON "public"."audit_log" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id")));



CREATE POLICY "mov_delete" ON "public"."movimentacoes" FOR DELETE TO "authenticated" USING ("public"."e_dono_da_empresa"("empresa_id"));



CREATE POLICY "mov_insert" ON "public"."movimentacoes" FOR INSERT TO "authenticated" WITH CHECK ("public"."pode_lancar"("empresa_id"));



CREATE POLICY "mov_select" ON "public"."movimentacoes" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id") OR "public"."e_vendedor_da_empresa"("empresa_id")));



CREATE POLICY "mov_update" ON "public"."movimentacoes" FOR UPDATE TO "authenticated" USING ("public"."pode_lancar"("empresa_id")) WITH CHECK ("public"."pode_lancar"("empresa_id"));



ALTER TABLE "public"."movimentacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pag_admin" ON "public"."pagamentos" TO "authenticated" USING ("public"."e_admin_ou_dono_programa"()) WITH CHECK ("public"."e_admin_ou_dono_programa"());



CREATE POLICY "pag_select" ON "public"."pagamentos" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id") OR "public"."e_vendedor_da_empresa"("empresa_id")));



ALTER TABLE "public"."pagamentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pedidos_contratacao" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pedidos_insert_publico" ON "public"."pedidos_contratacao" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "pedidos_select" ON "public"."pedidos_contratacao" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR ("vendedor_id" = "auth"."uid"())));



CREATE POLICY "pedidos_select_admin" ON "public"."pedidos_contratacao" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."role" = ANY (ARRAY['admin_programa'::"text", 'dono_programa'::"text"]))))));



CREATE POLICY "pedidos_update_admin" ON "public"."pedidos_contratacao" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."role" = ANY (ARRAY['admin_programa'::"text", 'dono_programa'::"text"]))))));



CREATE POLICY "pedidos_update_vendedor" ON "public"."pedidos_contratacao" FOR UPDATE TO "authenticated" USING (("vendedor_id" = "auth"."uid"())) WITH CHECK (("vendedor_id" = "auth"."uid"()));



ALTER TABLE "public"."planos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "planos_admin" ON "public"."planos" TO "authenticated" USING ("public"."e_admin_programa"()) WITH CHECK ("public"."e_admin_programa"());



CREATE POLICY "planos_select" ON "public"."planos" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "solicitacoes_admin_all" ON "public"."solicitacoes_exclusao" USING ((EXISTS ( SELECT 1
   FROM "public"."usuarios"
  WHERE (("usuarios"."id" = "auth"."uid"()) AND ("usuarios"."role" = ANY (ARRAY['admin_programa'::"text", 'dono_programa'::"text"]))))));



ALTER TABLE "public"."solicitacoes_exclusao" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tb_select" ON "public"."transacoes_bancarias" FOR SELECT TO "authenticated" USING (("public"."e_admin_ou_dono_programa"() OR "public"."e_vinculado"("empresa_id")));



CREATE POLICY "tb_write" ON "public"."transacoes_bancarias" TO "authenticated" USING ("public"."e_vinculado"("empresa_id")) WITH CHECK ("public"."e_vinculado"("empresa_id"));



ALTER TABLE "public"."transacoes_bancarias" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_empresas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_empresas_admin_all" ON "public"."user_empresas" TO "authenticated" USING ("public"."e_admin_ou_dono_programa"()) WITH CHECK ("public"."e_admin_ou_dono_programa"());



CREATE POLICY "user_empresas_dono_insert" ON "public"."user_empresas" FOR INSERT TO "authenticated" WITH CHECK (("public"."e_dono_da_empresa"("empresa_id") AND ("papel" = ANY (ARRAY['operador'::"text", 'leitor'::"text"]))));



CREATE POLICY "user_empresas_select" ON "public"."user_empresas" FOR SELECT TO "authenticated" USING ((("usuario_id" = "auth"."uid"()) OR "public"."e_admin_ou_dono_programa"()));



ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "usuarios_admin_all" ON "public"."usuarios" TO "authenticated" USING ("public"."e_admin_ou_dono_programa"()) WITH CHECK ("public"."e_admin_ou_dono_programa"());



CREATE POLICY "usuarios_select" ON "public"."usuarios" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR "public"."e_admin_ou_dono_programa"() OR (EXISTS ( SELECT 1
   FROM ("public"."user_empresas" "ue1"
     JOIN "public"."user_empresas" "ue2" ON (("ue1"."empresa_id" = "ue2"."empresa_id")))
  WHERE (("ue1"."usuario_id" = "auth"."uid"()) AND ("ue2"."usuario_id" = "usuarios"."id"))))));



CREATE POLICY "usuarios_update_proprio" ON "public"."usuarios" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."alterar_comissao_vendedor"("p_usuario_id" "uuid", "p_comissao" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."alterar_comissao_vendedor"("p_usuario_id" "uuid", "p_comissao" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."alterar_comissao_vendedor"("p_usuario_id" "uuid", "p_comissao" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."alterar_plano_empresa"("p_empresa_id" "uuid", "p_novo_plano_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."alterar_plano_empresa"("p_empresa_id" "uuid", "p_novo_plano_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."alterar_plano_empresa"("p_empresa_id" "uuid", "p_novo_plano_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."aprovar_pedido"("p_pedido_id" "uuid", "p_senha_provisoria" "text", "p_marco_pago" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."aprovar_pedido"("p_pedido_id" "uuid", "p_senha_provisoria" "text", "p_marco_pago" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."aprovar_pedido"("p_pedido_id" "uuid", "p_senha_provisoria" "text", "p_marco_pago" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."criar_usuario"("p_nome" "text", "p_email" "text", "p_senha" "text", "p_telefone" "text", "p_empresa_id" "uuid", "p_papel" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."criar_usuario"("p_nome" "text", "p_email" "text", "p_senha" "text", "p_telefone" "text", "p_empresa_id" "uuid", "p_papel" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."criar_usuario"("p_nome" "text", "p_email" "text", "p_senha" "text", "p_telefone" "text", "p_empresa_id" "uuid", "p_papel" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."e_admin_ou_dono_programa"() TO "anon";
GRANT ALL ON FUNCTION "public"."e_admin_ou_dono_programa"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_admin_ou_dono_programa"() TO "service_role";



GRANT ALL ON FUNCTION "public"."e_admin_programa"() TO "anon";
GRANT ALL ON FUNCTION "public"."e_admin_programa"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_admin_programa"() TO "service_role";



GRANT ALL ON FUNCTION "public"."e_dono_da_empresa"("emp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."e_dono_da_empresa"("emp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_dono_da_empresa"("emp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."e_vendedor"() TO "anon";
GRANT ALL ON FUNCTION "public"."e_vendedor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_vendedor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."e_vendedor_da_empresa"("emp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."e_vendedor_da_empresa"("emp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_vendedor_da_empresa"("emp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."e_vinculado"("emp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."e_vinculado"("emp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."e_vinculado"("emp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pode_lancar"("emp_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."pode_lancar"("emp_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pode_lancar"("emp_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."remover_usuario"("p_usuario_id" "uuid", "p_empresa_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remover_usuario"("p_usuario_id" "uuid", "p_empresa_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remover_usuario"("p_usuario_id" "uuid", "p_empresa_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."resetar_senha_usuario"("p_usuario_id" "uuid", "p_nova_senha" "text", "p_empresa_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."resetar_senha_usuario"("p_usuario_id" "uuid", "p_nova_senha" "text", "p_empresa_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resetar_senha_usuario"("p_usuario_id" "uuid", "p_nova_senha" "text", "p_empresa_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."assinaturas" TO "anon";
GRANT ALL ON TABLE "public"."assinaturas" TO "authenticated";
GRANT ALL ON TABLE "public"."assinaturas" TO "service_role";



GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."empresas" TO "anon";
GRANT ALL ON TABLE "public"."empresas" TO "authenticated";
GRANT ALL ON TABLE "public"."empresas" TO "service_role";



GRANT ALL ON TABLE "public"."planos" TO "anon";
GRANT ALL ON TABLE "public"."planos" TO "authenticated";
GRANT ALL ON TABLE "public"."planos" TO "service_role";



GRANT ALL ON TABLE "public"."clientes_publicos" TO "anon";
GRANT ALL ON TABLE "public"."clientes_publicos" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes_publicos" TO "service_role";



GRANT ALL ON TABLE "public"."conciliacoes" TO "anon";
GRANT ALL ON TABLE "public"."conciliacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."conciliacoes" TO "service_role";



GRANT ALL ON TABLE "public"."contas_bancarias" TO "anon";
GRANT ALL ON TABLE "public"."contas_bancarias" TO "authenticated";
GRANT ALL ON TABLE "public"."contas_bancarias" TO "service_role";



GRANT ALL ON TABLE "public"."empresa_vendedores" TO "anon";
GRANT ALL ON TABLE "public"."empresa_vendedores" TO "authenticated";
GRANT ALL ON TABLE "public"."empresa_vendedores" TO "service_role";



GRANT ALL ON TABLE "public"."movimentacoes" TO "anon";
GRANT ALL ON TABLE "public"."movimentacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."movimentacoes" TO "service_role";



GRANT ALL ON TABLE "public"."pagamentos" TO "anon";
GRANT ALL ON TABLE "public"."pagamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."pagamentos" TO "service_role";



GRANT ALL ON TABLE "public"."pagamentos_publicos" TO "anon";
GRANT ALL ON TABLE "public"."pagamentos_publicos" TO "authenticated";
GRANT ALL ON TABLE "public"."pagamentos_publicos" TO "service_role";



GRANT ALL ON TABLE "public"."pedidos_contratacao" TO "anon";
GRANT ALL ON TABLE "public"."pedidos_contratacao" TO "authenticated";
GRANT ALL ON TABLE "public"."pedidos_contratacao" TO "service_role";



GRANT ALL ON TABLE "public"."pedidos_publicos" TO "anon";
GRANT ALL ON TABLE "public"."pedidos_publicos" TO "authenticated";
GRANT ALL ON TABLE "public"."pedidos_publicos" TO "service_role";



GRANT ALL ON TABLE "public"."solicitacoes_exclusao" TO "anon";
GRANT ALL ON TABLE "public"."solicitacoes_exclusao" TO "authenticated";
GRANT ALL ON TABLE "public"."solicitacoes_exclusao" TO "service_role";



GRANT ALL ON TABLE "public"."transacoes_bancarias" TO "anon";
GRANT ALL ON TABLE "public"."transacoes_bancarias" TO "authenticated";
GRANT ALL ON TABLE "public"."transacoes_bancarias" TO "service_role";



GRANT ALL ON TABLE "public"."user_empresas" TO "anon";
GRANT ALL ON TABLE "public"."user_empresas" TO "authenticated";
GRANT ALL ON TABLE "public"."user_empresas" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."vendedores_com_carteira" TO "anon";
GRANT ALL ON TABLE "public"."vendedores_com_carteira" TO "authenticated";
GRANT ALL ON TABLE "public"."vendedores_com_carteira" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







