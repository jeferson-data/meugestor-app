
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { Database } from '../_shared/database.types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(
  status: number,
  corpo: Record<string, unknown>
) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return resposta(405, { error: 'Método não permitido.' });
  }

  let vendedorId: string | null = null;
  let admin: ReturnType<typeof createClient<Database>> | null = null;

  try {
    // 1. Verificar autenticação
    const authorization = req.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return resposta(401, { error: 'Autenticação obrigatória.' });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return resposta(401, { error: 'Token de acesso ausente.' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('Configuração de ambiente incompleta.');
      return resposta(500, {
        error: 'Configuração do servidor incompleta.',
      });
    }

    // Cliente utilizado somente para validar o JWT
    const autenticacao = createClient<Database>(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user: solicitante },
      error: erroAuth,
    } = await autenticacao.auth.getUser(token);

    if (erroAuth || !solicitante) {
      return resposta(401, { error: 'Sessão inválida ou expirada.' });
    }

    // 2. Ler e validar os dados recebidos
    
    // 2. Ler e validar os dados recebidos
    let body: Record<string, unknown>;

    try {
      const conteudo = await req.json();

      if (
        typeof conteudo !== 'object' ||
        conteudo === null ||
        Array.isArray(conteudo)
      ) {
        return resposta(400, {
          error: 'Formato dos dados inválido.',
        });
      }

      body = conteudo as Record<string, unknown>;
    } catch {
      return resposta(400, {
        error: 'O conteúdo enviado não é um JSON válido.',
      });
    }

    const nome =
      typeof body.nome === 'string' ? body.nome.trim() : '';

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    const telefone =
      typeof body.telefone === 'string'
        ? body.telefone.trim() || null
        : null;

    const empresaId =
      typeof body.empresa_id === 'string'
        ? body.empresa_id.trim()
        : '';

    if (!nome || !email || !empresaId) {
      return resposta(400, {
        error: 'Nome, e-mail e empresa são obrigatórios.',
      });
    }

    if (
      nome.length > 120 ||
      email.length > 254 ||
      (telefone !== null && telefone.length > 30)
    ) {
      return resposta(400, {
        error: 'Dados informados inválidos.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return resposta(400, {
        error: 'Informe um endereço de e-mail válido.',
      });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(empresaId)) {
      return resposta(400, {
        error: 'Identificador de empresa inválido.',
      });
    }

    const valorComissao = body.comissao_percentual;

    const comissao =
      valorComissao === undefined || valorComissao === null
        ? 15
        : typeof valorComissao === 'number'
          ? valorComissao
          : NaN;

    if (
      !Number.isFinite(comissao) ||
      comissao < 0 ||
      comissao > 100
    ) {
      return resposta(400, {
        error: 'A comissão deve ser um número entre 0 e 100.',
      });
    }


    if (!nome || !email || !empresaId) {
      return resposta(400, {
        error: 'Nome, e-mail e empresa são obrigatórios.',
      });
    }

    if (nome.length > 120 || email.length > 254) {
      return resposta(400, { error: 'Dados informados inválidos.' });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(empresaId)) {
      return resposta(400, { error: 'Identificador de empresa inválido.' });
    }

    const comissao =
      body.comissao_percentual == null
        ? 15
        : Number(body.comissao_percentual);

    if (!Number.isFinite(comissao) || comissao < 0 || comissao > 100) {
      return resposta(400, {
        error: 'A comissão deve estar entre 0 e 100.',
      });
    }

    // 3. Criar cliente administrativo no servidor
    admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 4. Verificar se o solicitante existe e está ativo
    const { data: usuario, error: erroUsuario } = await admin
      .from('usuarios')
      .select('id, role, ativo')
      .eq('id', solicitante.id)
      .maybeSingle();

    if (erroUsuario) {
      console.error('Erro ao consultar solicitante:', erroUsuario);
      return resposta(500, {
        error: 'Não foi possível validar as permissões.',
      });
    }

    if (!usuario || usuario.ativo !== true) {
      return resposta(403, {
        error: 'Usuário inexistente ou inativo.',
      });
    }

    // 5. Verificar se o solicitante pode cadastrar vendedores
    const ehAdministrador =
      usuario.role === 'admin_programa' ||
      usuario.role === 'dono_programa';

    if (!ehAdministrador) {
      const { data: vinculo, error: erroVinculo } = await admin
        .from('user_empresas')
        .select('id')
        .eq('usuario_id', solicitante.id)
        .eq('empresa_id', empresaId)
        .eq('papel', 'dono')
        .maybeSingle();

      if (erroVinculo) {
        console.error('Erro ao consultar vínculo:', erroVinculo);
        return resposta(500, {
          error: 'Não foi possível validar o acesso à empresa.',
        });
      }

      if (!vinculo) {
        return resposta(403, {
          error: 'Você não tem autorização para cadastrar vendedores nesta empresa.',
        });
      }
    }

    // 6. Verificar se a empresa está ativa
    const { data: empresa, error: erroEmpresa } = await admin
      .from('empresas')
      .select('id, status_acesso')
      .eq('id', empresaId)
      .maybeSingle();

    if (erroEmpresa) {
      console.error('Erro ao consultar empresa:', erroEmpresa);
      return resposta(500, {
        error: 'Não foi possível validar a empresa.',
      });
    }

    if (!empresa || empresa.status_acesso !== 'ativo') {
      return resposta(403, {
        error: 'Empresa inexistente, suspensa ou arquivada.',
      });
    }

    // 7. Criar usuário no Supabase Auth
    const senhaTemp = crypto.randomUUID().slice(0, 16);

    const { data: auth, error: erroCriacaoAuth } =
      await admin.auth.admin.createUser({
        email,
        password: senhaTemp,
        email_confirm: true,
      });

    if (erroCriacaoAuth || !auth.user) {
      console.error('Erro ao criar usuário Auth:', erroCriacaoAuth);
      return resposta(400, {
        error: 'Não foi possível criar o usuário. Verifique o e-mail informado.',
      });
    }

    vendedorId = auth.user.id;

    // 8. Criar perfil na tabela usuarios
    const { error: erroPerfil } = await admin
      .from('usuarios')
      .insert({
        id: vendedorId,
        nome,
        email,
        telefone,
        role: 'vendedor',
        ativo: true,
        comissao_percentual: comissao,
      });

    if (erroPerfil) {
      console.error('Erro ao criar perfil:', erroPerfil);

      await admin.auth.admin.deleteUser(vendedorId);
      vendedorId = null;

      return resposta(500, {
        error: 'Não foi possível concluir o cadastro do vendedor.',
      });
    }

    // 9. Vincular vendedor à empresa
    const { error: erroAssociacao } = await admin
      .from('empresa_vendedores')
      .insert({
        empresa_id: empresaId,
        vendedor_id: vendedorId,
        ativo: true,
        principal: true,
      });

    if (erroAssociacao) {
      console.error('Erro ao vincular vendedor:', erroAssociacao);

      await admin.from('usuarios').delete().eq('id', vendedorId);
      await admin.auth.admin.deleteUser(vendedorId);
      vendedorId = null;

      return resposta(500, {
        error: 'Não foi possível vincular o vendedor à empresa.',
      });
    }

    // 10. Retornar no formato esperado pelo frontend
    return resposta(200, {
      id: vendedorId,
      senha_temporaria: senhaTemp,
    });

  } catch (err) {
    console.error('Erro inesperado em criar-vendedor:', err);

    // Tentativa de limpeza em caso de falha inesperada
    if (admin && vendedorId) {
      await admin.from('empresa_vendedores')
        .delete()
        .eq('vendedor_id', vendedorId);

      await admin.from('usuarios')
        .delete()
        .eq('id', vendedorId);

      await admin.auth.admin.deleteUser(vendedorId);
    }

    return resposta(500, {
      error: 'Ocorreu um erro interno ao cadastrar o vendedor.',
    });
  }
});
