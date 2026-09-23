import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, Save, Download } from 'lucide-react';

export function PerfilEmpresa() {
  const { empresaAtiva, recarregarPerfil, exportarMeusDados } = useApp();

  const [form, setForm] = useState({
    nome: '',
    nome_fantasia: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (empresaAtiva) {
      setForm({
        nome: empresaAtiva.nome || '',
        nome_fantasia: empresaAtiva.nome_fantasia || '',
        cnpj: empresaAtiva.cnpj || '',
        telefone: empresaAtiva.telefone || '',
        email: empresaAtiva.email || '',
        endereco: empresaAtiva.endereco || '',
      });
      setErro('');
      setSucesso('');
    }
  }, [empresaAtiva]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!empresaAtiva) return setErro('Nenhuma empresa ativa.');
    if (!form.nome.trim()) return setErro('O nome da empresa é obrigatório.');

    setLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: form.nome.trim(),
          nome_fantasia: form.nome_fantasia.trim() || null,
          cnpj: form.cnpj.trim() || null,
          telefone: form.telefone.trim() || null,
          email: form.email.trim() || null,
          endereco: form.endereco.trim() || null,
        })
        .eq('id', empresaAtiva.id);

      if (error) throw error;

      setSucesso('Dados atualizados com sucesso.');
      await recarregarPerfil();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    setErro('');
    setSucesso('');
    setExportando(true);
    const res = await exportarMeusDados();
    setExportando(false);

    if (!res.success) {
      setErro('Não foi possível exportar: ' + res.error);
      return;
    }
    setSucesso('Download iniciado. Verifique a pasta de downloads.');
  };

  if (!empresaAtiva) {
    return (
      <div className="text-brand-muted">Nenhuma empresa ativa selecionada.</div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="text-brand-green" size={28} />
        <h1 className="text-2xl font-bold">Perfil da empresa</h1>
      </div>
      <p className="text-brand-muted mb-6">
        Alterar os dados de <strong>{empresaAtiva.nome}</strong>.
      </p>

      {erro && (
        <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="bg-brand-green/10 border border-brand-green text-brand-green text-sm rounded-xl px-4 py-3 mb-4">
          {sucesso}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome / Razão social"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <Input
          label="Nome fantasia"
          value={form.nome_fantasia}
          onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
          placeholder="Nome curto para o Dashboard"
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
          placeholder="Rua, número, bairro, cidade, estado"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {loading ? 'A guardar...' : 'Guardar alterações'}
        </Button>
      </form>

      {/* Exportação de dados (LGPD) */}
      <div className="mt-8 p-5 bg-brand-card border border-brand-border rounded-2xl">
        <h2 className="font-bold mb-1 flex items-center gap-2">
          <Download size={18} className="text-brand-green" />
          Meus dados
        </h2>
        <p className="text-brand-muted text-sm mb-4">
          Baixe uma cópia de todos os seus dados guardados no MeuGestor, em
          formato CSV. Inclui seus dados pessoais, os dados da empresa, todas
          as movimentações e o histórico de atividades.
        </p>
        <button
          type="button"
          onClick={handleExportar}
          disabled={exportando}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-green text-brand-green hover:bg-brand-green/10 transition text-sm font-semibold disabled:opacity-40"
        >
          <Download size={16} />
          {exportando ? 'A preparar...' : 'Baixar cópia dos meus dados'}
        </button>
        <p className="text-brand-subtle text-xs mt-3">
          Base legal: LGPD, art. 18, II e V — direito de acesso e portabilidade.
        </p>
      </div>

      <div className="mt-8 p-4 bg-brand-card border border-brand-border rounded-xl text-xs text-brand-muted">
        <strong className="text-brand-text block mb-1">
          Para alterar o plano ou o valor:
        </strong>
        O plano, valor mensal e estado de pagamento são geridos pela equipa
        MeuGestor. Para os alterar, contacte o suporte.
      </div>
    </div>
  );
}