import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, X, Trash2, KeyRound } from 'lucide-react';

export function Utilizadores() {
  const { empresaAtiva, perfil, empresas, recursosPlano } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);

  const [utilizadores, setUtilizadores] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);
  const [resetarSenha, setResetarSenha] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetErro, setResetErro] = useState('');

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    empresa_id: '',
    papel: 'operador',
  });

  const carregar = async () => {
    if (!empresaAtiva) return;

    try {
      const { data: vinculos } = await supabase
        .from('user_empresas')
        .select('papel, usuarios:usuario_id (id, nome, email)')
        .eq('empresa_id', empresaAtiva.id);

      const lista = (vinculos || [])
        .map((v) => (v.usuarios ? { ...v.usuarios, papel: v.papel } : null))
        .filter(Boolean);

      setUtilizadores(lista);

      const { data: logs } = await supabase
        .from('audit_log')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .order('quando', { ascending: false })
        .limit(20);

      setAuditLog(logs || []);
    } catch (err) {
      console.warn('Erro ao carregar utilizadores:', err);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line
  }, [empresaAtiva]);

  const abrirModal = () => {
    const maxUtilizadores = recursosPlano?.max_utilizadores || 1;
    if (utilizadores.length >= maxUtilizadores) {
      alert(
        `O seu plano permite até ${maxUtilizadores} utilizador(es). ` +
          `Faça upgrade para adicionar mais.`
      );
      return;
    }

    setForm({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      empresa_id: empresaAtiva?.id || '',
      papel: 'operador',
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
      if (!form.nome.trim()) throw new Error('Informe o nome.');
      if (!form.email.trim()) throw new Error('Informe o e-mail.');
      if (!form.senha || form.senha.length < 6)
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      if (!form.empresa_id) throw new Error('Escolha a empresa.');

      const { error } = await supabase.rpc('criar_usuario', {
        p_nome: form.nome,
        p_email: form.email,
        p_senha: form.senha,
        p_telefone: form.telefone,
        p_empresa_id: form.empresa_id,
        p_papel: form.papel,
      });

      if (error) throw error;

      fecharModal();
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async () => {
    if (!confirmarRemocao) return;
    try {
      const { error } = await supabase.rpc('remover_usuario', {
        p_usuario_id: confirmarRemocao.id,
        p_empresa_id: empresaAtiva.id,
      });
      if (error) throw error;
      setConfirmarRemocao(null);
      await carregar();
    } catch (err) {
      alert('Erro ao remover: ' + err.message);
      setConfirmarRemocao(null);
    }
  };

  const abrirResetSenha = (user) => {
    setResetarSenha(user);
    setNovaSenha('');
    setResetErro('');
  };

  const fecharResetSenha = () => {
    setResetarSenha(null);
    setNovaSenha('');
    setResetErro('');
  };

  const handleResetSenha = async (e) => {
    e.preventDefault();
    setResetErro('');

    if (!novaSenha || novaSenha.length < 6) {
      setResetErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase.rpc('resetar_senha_usuario', {
        p_usuario_id: resetarSenha.id,
        p_nova_senha: novaSenha,
        p_empresa_id: empresaAtiva.id,
      });
      if (error) throw error;

      alert(
        `Senha alterada com sucesso.\n\nNova senha: ${novaSenha}\n\nComunique ao utilizador.`
      );
      fecharResetSenha();
    } catch (err) {
      setResetErro(err.message);
    } finally {
      setResetting(false);
    }
  };

  const nomeEmpresaEscolhida = empresas.find(
    (e) => e.id === form.empresa_id
  )?.nome;

  const maxUtilizadores = recursosPlano?.max_utilizadores || 1;
  const maxLabel = maxUtilizadores >= 999 ? '∞' : maxUtilizadores;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Utilizadores e permissões</h1>
          <p className="text-brand-muted">
            Pessoas com acesso à empresa <strong>{empresaAtiva?.nome}</strong>.{' '}
            <span className="text-brand-green font-semibold">
              {utilizadores.length} de {maxLabel} utilizadores
            </span>
          </p>
        </div>
        <Button onClick={abrirModal} className="flex items-center gap-2">
          <Plus size={18} /> Novo utilizador
        </Button>
      </div>

      <h2 className="text-lg font-bold mb-3">Utilizadores</h2>
      {utilizadores.length === 0 && (
        <div className="text-brand-muted text-sm mb-6">
          Nenhum utilizador vinculado.
        </div>
      )}
      <div className="flex flex-col gap-2 mb-8">
        {utilizadores.map((u) => (
          <div
            key={u.id}
            className="bg-brand-card border border-brand-border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{u.nome}</div>
              <div className="text-brand-muted text-sm">{u.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-brand-green text-sm font-semibold">
                {u.papel}
              </div>
              <button
                onClick={() => abrirResetSenha(u)}
                className="text-brand-muted hover:text-brand-green transition"
                title="Resetar senha"
              >
                <KeyRound size={18} />
              </button>
              <button
                onClick={() => setConfirmarRemocao(u)}
                className="text-brand-muted hover:text-brand-red transition"
                title="Remover"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3">Trilha de auditoria recente</h2>
      {auditLog.length === 0 && (
        <div className="text-brand-muted text-sm">Sem registos ainda.</div>
      )}
      <div className="flex flex-col gap-2">
        {auditLog.map((log) => (
          <div
            key={log.id}
            className="bg-brand-card border border-brand-border rounded-xl p-3 text-sm"
          >
            <span className="font-semibold">
              {log.usuario_nome || 'Sistema'}
            </span>{' '}
            — {log.acao}
            <span className="text-brand-muted ml-2">
              {new Date(log.quando).toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>

      {/* MODAL NOVO UTILIZADOR */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Novo utilizador</h2>
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
                label="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome do utilizador"
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@empresa.com"
                required
              />
              <Input
                label="Senha provisória"
                type="text"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
              <Input
                label="Telefone"
                value={form.telefone}
                onChange={(e) =>
                  setForm({ ...form, telefone: e.target.value })
                }
                placeholder="(51) 99999-9999"
              />

              {isAdmin && (
                <div>
                  <label className="block text-sm font-semibold text-brand-muted mb-2">
                    Empresa onde este utilizador vai atuar
                  </label>
                  <select
                    value={form.empresa_id}
                    onChange={(e) =>
                      setForm({ ...form, empresa_id: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
                  >
                    <option value="">Escolha a empresa</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome}
                      </option>
                    ))}
                  </select>
                  {nomeEmpresaEscolhida && (
                    <p className="text-brand-green text-xs mt-2">
                      ✓ Vai criar utilizador vinculado a{' '}
                      <strong>{nomeEmpresaEscolhida}</strong>
                    </p>
                  )}
                </div>
              )}

              {!isAdmin && (
                <div>
                  <label className="block text-sm font-semibold text-brand-muted mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={empresaAtiva?.nome || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-[#1A2A44]/60 border border-brand-border text-brand-muted"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-brand-muted mb-2">
                  Papel na empresa
                </label>
                <select
                  value={form.papel}
                  onChange={(e) =>
                    setForm({ ...form, papel: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
                >
                  {isAdmin && <option value="dono">Dono</option>}
                  <option value="operador">Operador (lança e vê)</option>
                  <option value="leitor">Leitor (só consulta)</option>
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'A criar...' : 'Criar utilizador'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESETAR SENHA */}
      {resetarSenha && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Resetar senha</h2>
            <p className="text-brand-muted text-sm mb-4">
              Vai definir uma nova senha para{' '}
              <strong className="text-brand-text">{resetarSenha.nome}</strong>.
            </p>

            {resetErro && (
              <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
                {resetErro}
              </div>
            )}

            <form onSubmit={handleResetSenha} className="flex flex-col gap-4">
              <Input
                label="Nova senha"
                type="text"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={fecharResetSenha}
                  disabled={resetting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={resetting}
                >
                  {resetting ? 'A guardar...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REMOVER */}
      {confirmarRemocao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-red rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3 text-brand-red">
              Remover utilizador
            </h2>
            <p className="text-brand-muted text-sm mb-4">
              Tem a certeza que quer remover{' '}
              <strong>{confirmarRemocao.nome}</strong> da empresa{' '}
              <strong>{empresaAtiva?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmarRemocao(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRemover}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}