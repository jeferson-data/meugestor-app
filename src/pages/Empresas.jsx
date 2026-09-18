import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, Plus, X, Trash2, RefreshCcw } from 'lucide-react';

export function Empresas() {
  const { empresas, empresaAtiva, trocarEmpresa, perfil, recarregarPerfil } =
    useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState({}); // { empresa_id: { plano_nome, valor_centavos, fim_contrato, status } }
  const [loadingPlanos, setLoadingPlanos] = useState(true);

  // Modal Nova Empresa
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    plano_id: '',
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal Alterar Plano
  const [alterarPlano, setAlterarPlano] = useState(null);
  const [novoPlanoId, setNovoPlanoId] = useState('');
  const [erroPlano, setErroPlano] = useState('');
  const [salvandoPlano, setSalvandoPlano] = useState(false);

  // Modal Remover
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);
  const [removendo, setRemovendo] = useState(false);

  // ------------------------------------------------------------
  // Carregar planos e assinaturas ativas
  // ------------------------------------------------------------
  const carregarDados = async () => {
    setLoadingPlanos(true);
    try {
      // Planos
      const { data: planosData } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('valor_centavos');
      setPlanos(planosData || []);

      // Assinaturas ativas de todas as empresas
      const { data: assinData } = await supabase
        .from('assinaturas')
        .select('empresa_id, valor_centavos, fim_contrato, status, planos:plano_id (nome)')
        .eq('status', 'ativo');

      const mapa = {};
      (assinData || []).forEach((a) => {
        mapa[a.empresa_id] = {
          plano_nome: a.planos?.nome || '—',
          valor_centavos: a.valor_centavos,
          fim_contrato: a.fim_contrato,
          status: a.status,
        };
      });
      setAssinaturas(mapa);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoadingPlanos(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // ------------------------------------------------------------
  // Nova empresa
  // ------------------------------------------------------------
  const abrirModal = () => {
    setForm({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      plano_id: planos[0]?.id || '',
    });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      if (!form.nome.trim()) throw new Error('Informe o nome da empresa.');
      if (!form.plano_id) throw new Error('Escolha um plano.');

      const plano = planos.find((p) => p.id === form.plano_id);
      const hoje = new Date();
      const fim = new Date();
      fim.setDate(fim.getDate() + 30);

      const { data: empresa, error: errEmp } = await supabase
        .from('empresas')
        .insert([
          {
            nome: form.nome,
            cnpj: form.cnpj,
            telefone: form.telefone,
            email: form.email,
            endereco: form.endereco,
          },
        ])
        .select()
        .single();

      if (errEmp) throw errEmp;

      const { error: errAss } = await supabase.from('assinaturas').insert([
        {
          empresa_id: empresa.id,
          plano_id: form.plano_id,
          inicio_contrato: hoje.toISOString().slice(0, 10),
          fim_contrato: fim.toISOString().slice(0, 10),
          valor_centavos: plano.valor_centavos,
          status: 'ativo',
        },
      ]);

      if (errAss) throw errAss;

      const mesRef = hoje.toISOString().slice(0, 8) + '01';
      await supabase.from('pagamentos').insert([
        {
          empresa_id: empresa.id,
          mes_referencia: mesRef,
          valor_centavos: plano.valor_centavos,
          status: 'pendente',
        },
      ]);

      fecharModal();
      await recarregarPerfil();
      await carregarDados();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Alterar plano
  // ------------------------------------------------------------
  const abrirAlterarPlano = (empresa) => {
    const ass = assinaturas[empresa.id];
    const planoAtualId = planos.find((p) => p.nome === ass?.plano_nome)?.id;

    setAlterarPlano(empresa);
    setNovoPlanoId(planoAtualId || planos[0]?.id || '');
    setErroPlano('');
  };

  const fecharAlterarPlano = () => {
    setAlterarPlano(null);
    setNovoPlanoId('');
    setErroPlano('');
  };

  const handleAlterarPlano = async (e) => {
    e.preventDefault();
    setErroPlano('');

    if (!novoPlanoId) {
      setErroPlano('Escolha um plano.');
      return;
    }

    setSalvandoPlano(true);
    try {
      const { error } = await supabase.rpc('alterar_plano_empresa', {
        p_empresa_id: alterarPlano.id,
        p_novo_plano_id: novoPlanoId,
      });

      if (error) throw error;

      alert('Plano alterado com sucesso.');
      fecharAlterarPlano();
      await carregarDados();
    } catch (err) {
      setErroPlano(err.message);
    } finally {
      setSalvandoPlano(false);
    }
  };

  // ------------------------------------------------------------
  // Remover empresa
  // ------------------------------------------------------------
  const handleRemover = async () => {
    if (!confirmarRemocao) return;
    setRemovendo(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', confirmarRemocao.id);

      if (error) throw error;

      if (empresaAtiva?.id === confirmarRemocao.id) {
        localStorage.removeItem('meugestor_empresa_ativa');
      }

      setConfirmarRemocao(null);
      await recarregarPerfil();
      await carregarDados();
    } catch (err) {
      alert('Erro ao remover empresa: ' + err.message);
    } finally {
      setRemovendo(false);
    }
  };

  // ------------------------------------------------------------
  // Helpers visuais
  // ------------------------------------------------------------
  const corPlano = (nome) => {
    if (nome === 'Completo') return 'text-brand-green';
    if (nome === 'Padrão') return 'text-brand-blue';
    return 'text-brand-muted';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Empresas</h1>
          <p className="text-brand-muted">
            {isAdmin
              ? 'Todas as empresas clientes do serviço.'
              : 'Empresas às quais está vinculado.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={abrirModal} className="flex items-center gap-2">
            <Plus size={18} /> Nova empresa
          </Button>
        )}
      </div>

      {loadingPlanos && (
        <div className="text-brand-muted text-sm mb-4">A carregar...</div>
      )}

      {empresas.length === 0 && !loadingPlanos && (
        <div className="text-center text-brand-muted py-10">
          Nenhuma empresa encontrada.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {empresas.map((e) => {
          const isAtiva = empresaAtiva?.id === e.id;
          const ass = assinaturas[e.id];

          return (
            <div
              key={e.id}
              className={`bg-brand-card border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition ${
                isAtiva
                  ? 'border-brand-green'
                  : 'border-brand-border hover:border-brand-muted'
              }`}
            >
              {/* Info empresa */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <Building2 className="text-brand-green flex-shrink-0 mt-1" size={28} />
                <div className="min-w-0">
                  <div className="font-bold truncate">{e.nome}</div>
                  <div className="text-brand-muted text-sm">
                    {e.cnpj || 'Sem CNPJ'}
                  </div>

                  {/* Plano contratado */}
                  {ass ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className={`font-bold uppercase tracking-wide ${corPlano(ass.plano_nome)}`}>
                        Plano {ass.plano_nome}
                      </span>
                      <span className="text-brand-text font-semibold">
                        R$ {(ass.valor_centavos / 100).toFixed(2)}/mês
                      </span>
                      <span className="text-brand-subtle">
                        até {new Date(ass.fim_contrato).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 text-brand-red text-xs font-semibold">
                      ⚠ Sem plano ativo
                    </div>
                  )}

                  {/* Status de acesso */}
                  {e.status_acesso === 'suspenso' && (
                    <div className="text-brand-red text-xs mt-1 font-semibold">
                      🔒 Acesso suspenso
                    </div>
                  )}

                  {/* Papel do utilizador atual */}
                  {e.papel && (
                    <div className="text-brand-subtle text-xs mt-1">
                      O seu papel: {e.papel}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-3 flex-shrink-0 md:self-center">
                {!isAtiva ? (
                  <button
                    onClick={() => trocarEmpresa(e)}
                    className="text-brand-green font-semibold hover:underline"
                  >
                    Ativar
                  </button>
                ) : (
                  <span className="text-brand-green font-semibold">Ativa</span>
                )}

                {isAdmin && (
                  <>
                    <button
                      onClick={() => abrirAlterarPlano(e)}
                      className="text-brand-muted hover:text-brand-green transition p-2 rounded-lg"
                      title="Alterar plano"
                    >
                      <RefreshCcw size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmarRemocao(e)}
                      className="text-brand-muted hover:text-brand-red transition p-2 rounded-lg"
                      title="Remover empresa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          MODAL NOVA EMPRESA
      ============================================================ */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nova empresa</h2>
              <button
                onClick={fecharModal}
                className="text-brand-muted hover:text-brand-red"
              >
                <X size={22} />
              </button>
            </div>

            {erro && (
              <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nome da empresa"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Padaria Trigo Dourado"
                required
              />
              <Input
                label="CNPJ"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
              <Input
                label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(51) 3333-4444"
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
              <Input
                label="Endereço"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, número, cidade"
              />

              <div>
                <label className="block text-sm font-semibold text-brand-muted mb-2">
                  Plano inicial
                </label>
                <select
                  value={form.plano_id}
                  onChange={(e) =>
                    setForm({ ...form, plano_id: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
                >
                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {(p.valor_centavos / 100).toFixed(2)}/mês
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'A criar...' : 'Criar empresa'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL ALTERAR PLANO
      ============================================================ */}
      {alterarPlano && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-green rounded-2xl p-6">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold">Alterar plano</h2>
              <button
                onClick={fecharAlterarPlano}
                className="text-brand-muted hover:text-brand-red"
              >
                <X size={22} />
              </button>
            </div>
            <p className="text-brand-muted text-sm mb-4">
              Empresa: <strong className="text-brand-text">{alterarPlano.nome}</strong>
            </p>

            {/* Plano atual */}
            {assinaturas[alterarPlano.id] && (
              <div className="bg-brand-darker border border-brand-border rounded-xl p-3 mb-4 text-sm">
                <div className="text-brand-muted text-xs uppercase tracking-wide mb-1">
                  Plano atual
                </div>
                <div className="font-bold">
                  {assinaturas[alterarPlano.id].plano_nome} —{' '}
                  <span className="text-brand-green">
                    R$ {(assinaturas[alterarPlano.id].valor_centavos / 100).toFixed(2)}/mês
                  </span>
                </div>
              </div>
            )}

            {erroPlano && (
              <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
                {erroPlano}
              </div>
            )}

            <form onSubmit={handleAlterarPlano} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-muted mb-2">
                  Novo plano
                </label>
                <select
                  value={novoPlanoId}
                  onChange={(e) => setNovoPlanoId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
                >
                  {planos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {(p.valor_centavos / 100).toFixed(2)}/mês
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-brand-subtle text-xs">
                A assinatura atual será cancelada e uma nova com o plano
                escolhido será criada. O histórico fica guardado.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={fecharAlterarPlano}
                  disabled={salvandoPlano}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={salvandoPlano}
                >
                  {salvandoPlano ? 'A guardar...' : 'Alterar plano'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL CONFIRMAR REMOÇÃO
      ============================================================ */}
      {confirmarRemocao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-card border border-brand-red rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3 text-brand-red">
              Remover empresa
            </h2>

            <p className="text-brand-muted text-sm mb-4">
              Tem a certeza que quer remover{' '}
              <strong className="text-brand-text">
                {confirmarRemocao.nome}
              </strong>
              ? Esta ação é <strong className="text-brand-red">permanente</strong> e apaga:
            </p>

            <ul className="text-brand-muted text-sm mb-4 list-disc pl-5 space-y-1">
              <li>Movimentações da empresa</li>
              <li>Assinatura e histórico de pagamentos</li>
              <li>Vínculos de utilizadores com a empresa</li>
              <li>Contas bancárias e transações</li>
              <li>Trilha de auditoria</li>
            </ul>

            <p className="text-brand-subtle text-xs mb-5">
              Os utilizadores da empresa não são apagados — apenas ficam sem
              vínculo com esta empresa.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmarRemocao(null)}
                disabled={removendo}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRemover}
                disabled={removendo}
              >
                {removendo ? 'A remover...' : 'Remover empresa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}