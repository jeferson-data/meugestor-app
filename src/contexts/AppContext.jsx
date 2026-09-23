import {
  gerarExportacaoCompleta,
  baixarArquivo,
  nomeArquivoExportacao,
} from '../utils/exportarDados';
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
import { CATEGORIAS } from '../utils/categorias';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

/**
 * Valida se a categoria pertence ao tipo informado.
 * Lança erro caso contrário, para impedir dados inválidos no banco.
 */
function validarCategoria(tipo, categoria) {
  if (!tipo) {
    throw new Error('Tipo é obrigatório.');
  }
  const categoriasValidas = CATEGORIAS[tipo] ?? [];
  if (!categoriasValidas.length) {
    throw new Error('Tipo de lançamento inválido.');
  }
  if (!categoria) {
    throw new Error('Categoria é obrigatória.');
  }
  if (!categoriasValidas.includes(categoria)) {
    throw new Error('Categoria incompatível com o tipo do lançamento.');
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [conciliacoes, setConciliacoes] = useState([]);
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
  // Conciliações (leitura)
  // ------------------------------------------------------------
  const carregarConciliacoes = useCallback(async () => {
    if (!empresaAtiva) {
      setConciliacoes([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('conciliacoes')
        .select('*')
        .eq('empresa_id', empresaAtiva.id)
        .order('confirmado_em', { ascending: false });

      if (error) throw error;
      setConciliacoes(data || []);
    } catch (err) {
      // A tabela pode não existir ainda em ambientes antigos; não quebra a app.
      console.warn('Erro ao carregar conciliações:', err?.message);
      setConciliacoes([]);
    }
  }, [empresaAtiva]);

  useEffect(() => {
    carregarConciliacoes();
  }, [carregarConciliacoes]);

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

      validarCategoria(dados.tipo, dados.categoria);

      const nova = {
        empresa_id: empresaAtiva.id,
        tipo: dados.tipo,
        categoria: dados.categoria,
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
      if (!dados.tipo) throw new Error('Tipo é obrigatório.');
      if (!dados.valor_centavos || dados.valor_centavos <= 0) {
        throw new Error('Valor deve ser maior que zero.');
      }

      validarCategoria(dados.tipo, dados.categoria);

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
      setConciliacoes((prev) => prev.filter((c) => c.movimentacao_id !== id));
      await registarAuditLog('Removeu movimentação');
      return { success: true };
    } catch (err) {
      console.error('Erro ao remover movimentação:', err);
      return { success: false, error: err.message };
    }
  };

  // ------------------------------------------------------------
  // Conciliação bancária (escrita)
  // ------------------------------------------------------------

  /**
   * Persiste a confirmação de um par (item do arquivo ↔ lançamento do sistema).
   * Espera receber o objeto `par` devolvido por `conciliar()`:
   *   { item: { data, descricao, valor_centavos }, movimentacao: { id, ... } }
   */
  const confirmarConciliacao = async (par) => {
    try {
      if (!empresaAtiva) throw new Error('Nenhuma empresa ativa.');
      if (!par?.item || !par?.movimentacao) {
        throw new Error('Par de conciliação inválido.');
      }

      const { data, error } = await supabase
        .from('conciliacoes')
        .insert([
          {
            empresa_id: empresaAtiva.id,
            movimentacao_id: par.movimentacao.id,
            data_arquivo: par.item.data,
            descricao_arquivo: par.item.descricao,
            valor_centavos: par.item.valor_centavos,
            status: 'conciliado',
            confirmado_por: perfil?.nome || 'Sistema',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setConciliacoes((prev) => [data, ...prev]);
      await registarAuditLog(
        `Conciliou "${par.item.descricao}" com "${par.movimentacao.descricao}"`
      );
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao confirmar conciliação:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Confirma vários pares em lote. Recebe um array de pares.
   * Devolve { confirmados, falhas }.
   */
  const confirmarConciliacoesEmLote = async (pares) => {
    if (!Array.isArray(pares) || !pares.length) {
      return { confirmados: 0, falhas: [] };
    }

    let confirmados = 0;
    const falhas = [];
    const novasConciliacoes = [];

    for (const par of pares) {
      // Sequencial de propósito: garante ordem no audit_log
      // e evita concorrência desnecessária no Supabase.
      // eslint-disable-next-line no-await-in-loop
      const res = await confirmarConciliacao(par);
      if (res.success) {
        confirmados += 1;
        novasConciliacoes.push(res.data);
      } else {
        falhas.push({ par, erro: res.error });
      }
    }

    return { confirmados, falhas, novasConciliacoes };
  };

  /**
   * Reverte uma conciliação (usada quando o usuário desfaz uma confirmação).
   */
  const removerConciliacao = async (conciliacaoId) => {
    try {
      const { error } = await supabase
        .from('conciliacoes')
        .delete()
        .eq('id', conciliacaoId);

      if (error) throw error;

      setConciliacoes((prev) => prev.filter((c) => c.id !== conciliacaoId));
      await registarAuditLog('Reverteu uma conciliação');
      return { success: true };
    } catch (err) {
      console.error('Erro ao remover conciliação:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Devolve um Set com os IDs das movimentações já conciliadas.
   * Útil para o Extrato mostrar o selo "✓ conciliado" sem varrer
   * o array inteiro a cada render.
   */
  const movimentacoesConciliadas = React.useMemo(() => {
    const set = new Set();
    for (const c of conciliacoes) {
      if (c.status === 'conciliado') set.add(c.movimentacao_id);
    }
    return set;
  }, [conciliacoes]);

  // ------------------------------------------------------------
  // Value
  // ------------------------------------------------------------
  const value = {
    // Perfil / empresas / plano
    perfil,
    empresas,
    empresaAtiva,
    trocarEmpresa,
    plano,
    recursosPlano,
    loadingPlano,

    // Dados
    movimentacoes,
    auditLog,
    conciliacoes,
    movimentacoesConciliadas,
    loading,
    erro,

    // CRUD de movimentações
    adicionarMovimentacao,
    atualizarMovimentacao,
    removerMovimentacao,
    registarAuditLog,
    recarregarMovimentacoes: carregarMovimentacoes,
    recarregarPerfil: carregarPerfilEEmpresas,

    // Conciliação
    confirmarConciliacao,
    confirmarConciliacoesEmLote,
    removerConciliacao,
    recarregarConciliacoes: carregarConciliacoes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}