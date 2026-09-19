import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nome, email, telefone, empresa_id, comissao_percentual } =
      await req.json();

    if (!nome || !email || !empresa_id) {
      return new Response(
        JSON.stringify({ error: 'nome, email e empresa_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1) Cria no Auth com senha temporária
    const senhaTemp = crypto.randomUUID().slice(0, 16);
    const { data: auth, error: errAuth } = await admin.auth.admin.createUser({
      email,
      password: senhaTemp,
      email_confirm: true,
    });

    if (errAuth) {
      return new Response(JSON.stringify({ error: errAuth.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vendedorId = auth.user.id;

    // 2) Perfil em usuarios
    const { error: errUser } = await admin.from('usuarios').insert({
      id: vendedorId,
      nome,
      email,
      telefone,
      role: 'vendedor',
      ativo: true,
      comissao_percentual: comissao_percentual ?? 15,
    });

    if (errUser) {
      await admin.auth.admin.deleteUser(vendedorId);
      return new Response(JSON.stringify({ error: errUser.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3) Vínculo com empresa
    const { error: errVinc } = await admin
      .from('empresa_vendedores')
      .insert({
        empresa_id,
        vendedor_id: vendedorId,
        ativo: true,
        principal: true,
      });

    if (errVinc) {
      await admin.from('usuarios').delete().eq('id', vendedorId);
      await admin.auth.admin.deleteUser(vendedorId);
      return new Response(JSON.stringify({ error: errVinc.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ id: vendedorId, senha_temporaria: senhaTemp }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});