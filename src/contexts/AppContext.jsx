import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { useEmpresaAtiva } from '../hooks/useEmpresaAtiva';
import { usePlano } from '../hooks/usePlano';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const { empresaAtiva, trocarEmpresa } = useEmpresaAtiva(empresas);
  const { plano, recursos: recursosPlano, loading: loadingPlano } = usePlano(
    empresaAtiva?.id
  );

  // ------------------------------------------------------------
  // Perfil + Empresas
  // ------------------------------------------------------------
  const carregarPerfilEEmpresas = useCallback(async () => {
    if (!user) {
      setPerfil(null);
      setEmpresas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      const { data: perfilData, error: errPerfil } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (errPerfil) throw errPerfil;
      setPerfil(perfilData);

      let lista = [];

      if (['admin_programa', 'dono_programa'].includes(perfilData.role)) {
        const { data: todas, error: errTodas } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');
        if (errTodas) throw errTodas;
        lista = todas || [];
      } else {
        const { data: vinculos, error: errVinc } = await supabase
          .from('user_empresas')
          .select('papel, empresas:empresa_id (id, nome, cnpj, status_acesso)')
          .eq('usuario_id', user.id);
        if (errVinc) throw errVinc;

        lista = (vinculos || [])
          .map((v) => (v.empresas ? { ...v.empresas, papel: v.papel } : null))
          .filter(Boolean);
      }

      setEmpresas(lista);
    } catch (err) {
      console.error('Erro ao carregar perfil/empresas:', err);
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarPerfilEEmpresas();
  }, [carregarPerfilEEmpresas]);

  // ------------------------------------------------------------
  // Movimentações
  // ------------------------------------------------------------
  const carregarMovimentacoes = useCallback(async () => {
    if (!empresaAtiva) {
      setMovimentacoes([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .order('data', { ascending: false });

      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setMovimentacoes([]);
    }
  }, [empresaAtiva]);

  useEffect(() => {
    carregarMovimentacoes();
  }, [carregarMovimentacoes]);

  // ------------------------------------------------------------
  // Audit log
  // ------------------------------------------------------------
  const carregarAuditLog = useCallback(async () => {
    if (!empresaAtiva) {
      setAuditLog([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .order('quando', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLog(data || []);
    } catch {
      setAuditLog([]);
    }
  }, [empresaAtiva]);

  useEffect(() => {
    carregarAuditLog();
  }, [carregarAuditLog]);

  const registarAuditLog = async (acao) => {
    if (!empresaAtiva || !perfil) return;
    try {
      await supabase.from('audit_log').insert([
        {
          empresa_id: empresaAtiva.id,
          usuario_id: perfil.id,
          usuario_nome: perfil.nome,
          acao,
        },
      ]);
      carregarAuditLog();
    } catch (err) {
      console.warn('Erro ao registar audit log:', err);
    }
  };

  // ------------------------------------------------------------
  // CRUD de movimentações
  // ------------------------------------------------------------
  const adicionarMovimentacao = async (dados) => {
    try {
      if (!empresaAtiva) throw new Error('Nenhuma empresa ativa.');
      if (!dados.tipo) throw new Error('Tipo é obrigatório.');
      if (!dados.valor_centavos || dados.valor_centavos <= 0) {
        throw new Error('Valor deve ser maior que zero.');
      }

      const nova = {
        empresa_id: empresaAtiva.id,
        tipo: dados.tipo,
        categoria: dados.categoria || '',
        descricao: dados.descricao || '',
        valor_centavos: dados.valor_centavos,
        data: dados.data || new Date().toISOString().slice(0, 10),
        status: dados.status || 'pendente',
        lancado_por: perfil?.nome || 'Sistema',
      };

      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([nova])
        .select()
        .single();

      if (error) throw error;

      setMovimentacoes((prev) => [data, ...prev]);
      await registarAuditLog(
        `Lançou ${dados.tipo} de R$ ${(dados.valor_centavos / 100).toFixed(2)}`
      );
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao adicionar movimentação:', err);
      return { success: false, error: err.message };
    }
  };

  const atualizarMovimentacao = async (id, dados) => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .update({
          tipo: dados.tipo,
          categoria: dados.categoria,
          descricao: dados.descricao,
          valor_centavos: dados.valor_centavos,
          data: dados.data,
          status: dados.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMovimentacoes((prev) => prev.map((m) => (m.id === id ? data : m)));
      await registarAuditLog('Atualizou movimentação');
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar movimentação:', err);
      return { success: false, error: err.message };
    }
  };

  const removerMovimentacao = async (id) => {
    try {
      const { error } = await supabase
        .from('movimentacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMovimentacoes((prev) => prev.filter((m) => m.id !== id));
      await registarAuditLog('Removeu movimentação');
      return { success: true };
    } catch (err) {
      console.error('Erro ao remover movimentação:', err);
      return { success: false, error: err.message };
    }
  };

  // ------------------------------------------------------------
  // Value
  // ------------------------------------------------------------
  const value = {
    perfil,
    empresas,
    empresaAtiva,
    trocarEmpresa,
    plano,
    recursosPlano,
    loadingPlano,
    movimentacoes,
    auditLog,
    loading,
    erro,
    adicionarMovimentacao,
    atualizarMovimentacao,
    removerMovimentacao,
    registarAuditLog,
    recarregarMovimentacoes: carregarMovimentacoes,
    recarregarPerfil: carregarPerfilEEmpresas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}