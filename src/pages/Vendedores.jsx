import React, { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2, UserRound, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const formularioInicial = {
  nome: '',
  email: '',
  telefone: '',
  empresa_id: '',
};

export function Vendedores() {
  const { empresas, empresaAtiva, perfil } = useApp();
  const isAdmin = ['admin_programa', 'dono_programa'].includes(perfil?.role);
  const empresasVisiveis = isAdmin
    ? empresas
    : empresas.filter((empresa) => empresa.id === empresaAtiva?.id);

  const [vendedores, setVendedores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);
  const [form, setForm] = useState(formularioInicial);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [confirmarRemocao, setConfirmarRemocao] = useState(null);

  const carregar = async () => {
    if (!empresaAtiva && !isAdmin) {
      setVendedores([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      let consulta = supabase.from('vendedores').select('*').order('nome');
      if (!isAdmin) consulta = consulta.eq('empresa_id', empresaAtiva.id);

      const { data, error } = await consulta;
      if (error) throw error;
      setVendedores(data || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaAtiva, isAdmin]);

  const abrirNovo = () => {
    setVendedorEditando(null);
    setForm({ ...formularioInicial, empresa_id: empresaAtiva?.id || '' });
    setErro('');
    setModalAberto(true);
  };

  const abrirEdicao = (vendedor) => {
    setVendedorEditando(vendedor);
    setForm({
      nome: vendedor.nome || '',
      email: vendedor.email || '',
      telefone: vendedor.telefone || '',
      empresa_id: vendedor.empresa_id || '',
    });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setVendedorEditando(null);
    setErro('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');

    if (!form.nome.trim()) {
      setErro('Informe o nome do vendedor.');
      return;
    }
    if (!form.empresa_id) {
      setErro('Escolha a empresa vinculada.');
      return;
    }

    setLoading(true);
    try {
      const dados = {
        nome: form.nome.trim(),
        email: form.email.trim() || null,
        telefone: form.telefone.trim() || null,
        empresa_id: form.empresa_id,
      };

      const query = vendedorEditando
        ? supabase.from('vendedores').update(dados).eq('id', vendedorEditando.id)
        : supabase.from('vendedores').insert([dados]);
      const { error } = await query;
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
    setLoading(true);
    try {
      const { error } = await supabase
        .from('vendedores')
        .delete()
        .eq('id', confirmarRemocao.id);
      if (error) throw error;
      setConfirmarRemocao(null);
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nomeEmpresa = (empresaId) =>
    empresas.find((empresa) => empresa.id === empresaId)?.nome || 'Empresa não encontrada';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Vendedores</h1>
          <p className="text-brand-muted">
            {isAdmin
              ? 'Vendedores vinculados às empresas clientes.'
              : `Vendedores da empresa ${empresaAtiva?.nome || ''}.`}
          </p>
        </div>
        <Button onClick={abrirNovo} className="flex items-center gap-2">
          <Plus size={18} /> Novo vendedor
        </Button>
      </div>

      {erro && !modalAberto && (
        <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="text-brand-muted text-sm">A carregar vendedores...</div>
      ) : vendedores.length === 0 ? (
        <div className="text-center text-brand-muted py-10">
          Nenhum vendedor cadastrado.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vendedores.map((vendedor) => (
            <div
              key={vendedor.id}
              className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="rounded-full bg-brand-green/10 text-brand-green p-3">
                  <UserRound size={21} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{vendedor.nome}</div>
                  <div className="text-brand-muted text-sm truncate">
                    {vendedor.email || vendedor.telefone || 'Sem contacto'}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 text-brand-subtle text-xs mt-1">
                      <Building2 size={13} /> {nomeEmpresa(vendedor.empresa_id)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => abrirEdicao(vendedor)}
                  className="text-brand-muted hover:text-brand-green transition"
                  title="Editar vendedor"
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarRemocao(vendedor)}
                  className="text-brand-muted hover:text-brand-red transition"
                  title="Remover vendedor"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {vendedorEditando ? 'Editar vendedor' : 'Novo vendedor'}
              </h2>
              <button type="button" onClick={fecharModal} className="text-brand-muted hover:text-brand-red">
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
                onChange={(event) => setForm({ ...form, nome: event.target.value })}
                placeholder="Nome do vendedor"
                required
              />
              <Input
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="vendedor@empresa.com"
              />
              <Input
                label="Telefone"
                value={form.telefone}
                onChange={(event) => setForm({ ...form, telefone: event.target.value })}
                placeholder="(51) 99999-9999"
              />
              <div>
                <label className="block text-sm font-semibold text-brand-muted mb-2">Empresa vinculada</label>
                <select
                  value={form.empresa_id}
                  onChange={(event) => setForm({ ...form, empresa_id: event.target.value })}
                  disabled={!isAdmin}
                  className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green disabled:opacity-60"
                >
                  <option value="">Escolha a empresa</option>
                  {empresasVisiveis.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'A guardar...' : vendedorEditando ? 'Guardar alterações' : 'Cadastrar vendedor'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {confirmarRemocao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2">Remover vendedor?</h2>
            <p className="text-brand-muted text-sm mb-5">
              O vínculo de <strong>{confirmarRemocao.nome}</strong> será removido.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmarRemocao(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleRemover} disabled={loading}>Remover</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
