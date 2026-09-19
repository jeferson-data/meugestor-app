import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const RECURSOS_DEFAULT = {
  relatorios: false,
  conciliacao: false,
  max_utilizadores: 1,
};

export function usePlano(empresaId) {
  const [plano, setPlano] = useState(null);
  const [recursos, setRecursos] = useState(RECURSOS_DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setPlano(null);
      setRecursos(RECURSOS_DEFAULT);
      setLoading(false);
      return;
    }

    const carregar = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('assinaturas')
          .select('plano_id, status, planos:plano_id (id, nome, valor_centavos, recursos)')
          .eq('empresa_id', empresaId)
          .eq('status', 'ativo')
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data?.planos) {
          setPlano({
            id: data.planos.id,
            nome: data.planos.nome,
            valor_centavos: data.planos.valor_centavos,
          });
          setRecursos({ ...RECURSOS_DEFAULT, ...(data.planos.recursos || {}) });
        } else {
          setPlano(null);
          setRecursos(RECURSOS_DEFAULT);
        }
      } catch (err) {
        console.warn('Erro ao carregar plano:', err);
        setPlano(null);
        setRecursos(RECURSOS_DEFAULT);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [empresaId]);

  return { plano, recursos, loading };
}