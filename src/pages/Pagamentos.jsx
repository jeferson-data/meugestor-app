import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { formatarMoeda, formatarData, mesReferenciaAtual } from '../utils/formatters';

export function Pagamentos() {
  const { perfil } = useApp();
  const [empresas, setEmpresas] = useState([]);
  const [assinaturas, setAssinaturas] = useState({});
  const [pagamentos, setPagamentos] = useState({});
  const [loading, setLoading] = useState(true);

  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  const carregar = async () => {
    setLoading(true);
    try {
      const { data: emp } = await supabase.from('empresas').select('*').order('nome');
      setEmpresas(emp || []);

      const { data: ass } = await supabase.from('assinaturas').select('*, planos:plano_id (nome, valor_centavos)');
      const mapaAss = {};
      (ass || []).forEach((a) => { mapaAss[a.empresa_id] = a; });
      setAssinaturas(mapaAss);

      const mesRef = mesReferenciaAtual();
      const { data: pag } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('mes_referencia', mesRef);
      const mapaPag = {};
      (pag || []).forEach((p) => { mapaPag[p.empresa_id] = p; });
      setPagamentos(mapaPag);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const registarPagamento = async (empresa) => {
    const ass = assinaturas[empresa.id];
    if (!ass) return alert('Esta empresa não tem assinatura.');

    const { error } = await supabase.from('pagamentos').upsert(
      {
        empresa_id: empresa.id,
        mes_referencia: mesReferenciaAtual(),
        valor_centavos: ass.valor_centavos,
        status: 'pago',
        data_pagamento: new Date().toISOString().slice(0, 10),
        registrado_por: perfil.id,
      },
      { onConflict: 'empresa_id,mes_referencia' }
    );
    if (error) return alert(error.message);
    alert('Pagamento registado.');
    carregar();
  };

  const alternarAcesso = async (empresa) => {
    const novo = empresa.status_acesso === 'ativo' ? 'suspenso' : 'ativo';
    const { error } = await supabase
      .from('empresas')
      .update({ status_acesso: novo })
      .eq('id', empresa.id);
    if (error) return alert(error.message);
    alert(novo === 'ativo' ? 'Acesso liberado.' : 'Acesso bloqueado.');
    carregar();
  };

  if (!isAdmin) {
    return <div className="text-brand-muted">Acesso restrito.</div>;
  }

  if (loading) {
    return <div className="text-brand-muted">A carregar...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pagamentos</h1>
      <p className="text-brand-muted mb-6">Controlo de mensalidades das empresas clientes.</p>

      <div className="flex flex-col gap-4">
        {empresas.map((emp) => {
          const ass = assinaturas[emp.id];
          const pag = pagamentos[emp.id];
          const pagPago = pag?.status === 'pago';
          const suspenso = emp.status_acesso === 'suspenso';

          return (
            <div
              key={emp.id}
              className="bg-brand-card border border-brand-border rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-bold text-lg">{emp.nome}</div>
                  <div className="text-brand-muted text-sm">{emp.cnpj || 'Sem CNPJ'}</div>
                  {ass && (
                    <div className="text-brand-muted text-sm mt-1">
                      Plano <strong>{ass.planos?.nome}</strong> ·{' '}
                      {formatarMoeda(ass.valor_centavos)}/mês
                    </div>
                  )}
                  {ass && (
                    <div className="text-brand-subtle text-xs mt-1">
                      Contrato: {formatarData(ass.inicio_contrato)} a {formatarData(ass.fim_contrato)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className={`text-sm font-semibold ${pagPago ? 'text-brand-green' : 'text-brand-red'}`}>
                    {pagPago ? '✅ Pago este mês' : '⏳ Pendente este mês'}
                  </div>
                  <div className={`text-xs font-semibold ${suspenso ? 'text-brand-red' : 'text-brand-green'}`}>
                    {suspenso ? '🔒 Acesso suspenso' : '🔓 Acesso ativo'}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" onClick={() => registarPagamento(emp)}>
                      Registar pagamento
                    </Button>
                    <Button
                      size="sm"
                      variant={suspenso ? 'primary' : 'danger'}
                      onClick={() => alternarAcesso(emp)}
                    >
                      {suspenso ? 'Liberar' : 'Bloquear'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}