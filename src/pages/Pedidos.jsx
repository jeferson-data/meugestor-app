import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { formatarData } from '../utils/formatters';
import { gerarSenhaProvisoria } from '../utils/gerarSenha';
import { ModalAcesso } from '../components/ModalAcesso';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function Pedidos() {
  const { perfil } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aprovando, setAprovando] = useState(null);
  const [dadosAcesso, setDadosAcesso] = useState(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos_contratacao')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) throw error;
      setPedidos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) carregar();
  }, [isAdmin]);

  const aprovar = async (pedido) => {
    const confirmar = window.confirm(
      `Aprovar o pedido da empresa "${pedido.nome_empresa}"?\n\n` +
        `Isto vai criar:\n` +
        `• Empresa\n` +
        `• Assinatura (${pedido.plano_solicitado})\n` +
        `• Pagamento inicial\n` +
        `• Perfil do dono\n\n` +
        `Depois confirme o pagamento com o cliente.`
    );
    if (!confirmar) return;

    setAprovando(pedido.id);
    const senhaProvisoria = gerarSenhaProvisoria();

    try {
      const { data, error } = await supabase.rpc('aprovar_pedido', {
        p_pedido_id: pedido.id,
        p_senha_provisoria: senhaProvisoria,
        p_marco_pago: true,
      });

      if (error) throw error;

      const resultado = data?.[0];
      if (!resultado) throw new Error('Nenhum dado devolvido.');

      setDadosAcesso({
        empresa_nome: resultado.out_empresa_nome,
        dono_nome: resultado.out_dono_nome,
        dono_email: resultado.out_dono_email,
        senha_provisoria: resultado.out_senha_provisoria,
      });

      await carregar();
    } catch (err) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setAprovando(null);
    }
  };

  const rejeitar = async (pedido) => {
    if (!window.confirm(`Rejeitar o pedido de "${pedido.nome_empresa}"?`)) return;

    try {
      const { error } = await supabase
        .from('pedidos_contratacao')
        .update({ status: 'rejeitado' })
        .eq('id', pedido.id);
      if (error) throw error;
      await carregar();
    } catch (err) {
      alert('Erro ao rejeitar: ' + err.message);
    }
  };

  if (!isAdmin) {
    return <div className="text-brand-muted">Acesso restrito.</div>;
  }

  const pendentes = pedidos.filter((p) => p.status === 'pendente');
  const processados = pedidos.filter((p) => p.status !== 'pendente');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pedidos de contratação</h1>
          <p className="text-brand-muted">
            Pedidos preenchidos no formulário público. Aprove ou rejeite.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-brand-muted">A carregar...</div>
      )}

      {/* PENDENTES */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Clock size={18} className="text-brand-green" /> Pendentes
        <span className="text-brand-muted text-sm font-normal">
          ({pendentes.length})
        </span>
      </h2>

      {!loading && pendentes.length === 0 && (
        <div className="text-brand-muted text-sm mb-8">
          Sem pedidos pendentes.
        </div>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {pendentes.map((p) => (
          <div
            key={p.id}
            className="bg-brand-card border border-brand-border rounded-xl p-5"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">{p.nome_empresa}</div>
                <div className="text-brand-muted text-sm">
                  {p.cnpj || 'Sem CNPJ'} · {p.segmento || 'Sem segmento'}
                </div>
                <div className="text-brand-muted text-sm mt-2">
                  <strong className="text-brand-text">Responsável:</strong>{' '}
                  {p.nome_responsavel} · {p.email_responsavel} ·{' '}
                  {p.telefone_responsavel || 'sem telefone'}
                </div>
                <div className="text-brand-muted text-sm mt-1">
                  <strong className="text-brand-text">Plano:</strong>{' '}
                  {p.plano_solicitado} · <strong className="text-brand-text">Vencimento:</strong>{' '}
                  dia {p.dia_vencimento} · <strong className="text-brand-text">Forma:</strong>{' '}
                  {p.forma_pagamento}
                </div>
                {p.nome_operador && (
                  <div className="text-brand-muted text-sm mt-1">
                    <strong className="text-brand-text">Operador:</strong>{' '}
                    {p.nome_operador} · {p.email_operador}
                  </div>
                )}
                {p.observacoes && (
                  <div className="text-brand-subtle text-xs mt-2 italic">
                    "{p.observacoes}"
                  </div>
                )}
                <div className="text-brand-subtle text-xs mt-2">
                  Recebido em {formatarData(p.criado_em?.slice(0, 10))}
                </div>
              </div>

              <div className="flex md:flex-col gap-2 flex-shrink-0">
                <Button
                  onClick={() => aprovar(p)}
                  disabled={aprovando === p.id}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {aprovando === p.id ? 'A aprovar...' : 'Aprovar'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => rejeitar(p)}
                  className="flex items-center gap-2"
                >
                  <XCircle size={16} /> Rejeitar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PROCESSADOS */}
      {processados.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <FileText size={18} className="text-brand-muted" /> Histórico
            <span className="text-brand-muted text-sm font-normal">
              ({processados.length})
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {processados.map((p) => (
              <div
                key={p.id}
                className="bg-brand-card border border-brand-border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{p.nome_empresa}</div>
                  <div className="text-brand-muted text-xs">
                    {p.nome_responsavel} · {formatarData(p.criado_em?.slice(0, 10))}
                  </div>
                </div>
                <span
                  className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    p.status === 'aprovado'
                      ? 'bg-brand-green/15 text-brand-green'
                      : 'bg-brand-red/15 text-brand-red'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL DE ACESSO */}
      <ModalAcesso
        dados={dadosAcesso}
        onFechar={() => setDadosAcesso(null)}
      />
    </div>
  );
}