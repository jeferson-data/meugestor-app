import { useState, useEffect } from 'react';

const STORAGE_KEY = 'meugestor_empresa_ativa';

export function useEmpresaAtiva(empresas) {
  const [empresaAtiva, setEmpresaAtiva] = useState(null);

  useEffect(() => {
    if (!empresas || empresas.length === 0) {
      setEmpresaAtiva(null);
      return;
    }

    const guardadaId = localStorage.getItem(STORAGE_KEY);
    const encontrada = empresas.find((e) => e.id === guardadaId);

    if (encontrada) {
      setEmpresaAtiva(encontrada);
    } else {
      setEmpresaAtiva(empresas[0]);
      localStorage.setItem(STORAGE_KEY, empresas[0].id);
    }
  }, [empresas]);

  const trocarEmpresa = (empresa) => {
    setEmpresaAtiva(empresa);
    localStorage.setItem(STORAGE_KEY, empresa.id);
  };

  return { empresaAtiva, trocarEmpresa };
}