import React, { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { UploadArquivo } from '../components/conciliacao/UploadArquivo';
import { MapeamentoColunas } from '../components/conciliacao/MapeamentoColunas';
import { ListaConciliacao } from '../components/conciliacao/ListaConciliacao';
import {
  lerArquivo,
  normalizarItens,
  conciliar,
} from '../utils/conciliacao';

export function Conciliacao() {
  const {
    empresaAtiva,
    recursosPlano,
    plano,
    movimentacoes,
    registarAuditLog,
    confirmarConciliacao,
  } = useApp();

  const disponivel = [true, 'true', 1, '1'].includes(recursosPlano?.conciliacao);

  // -------------------------------------------------------------
  // Estados
  // -------------------------------------------------------------
  const [arquivo, setArquivo] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapeamento, setMapeamento] = useState({
    data: '',
    descricao: '',
    valor: '',
  });
  const [tipo, setTipo] = useState('receita');
  const [pares, setPares] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  // -------------------------------------------------------------
  // Gate de plano
  // -------------------------------------------------------------
  if (!disponivel) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Conciliação Bancária</h1>
        <p className="text-brand-muted mb-6">
          Compare os lançamentos do sistema com o extrato do banco.
        </p>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <Lock className="text-brand-muted mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Recurso indisponível</h2>
          <p className="text-brand-muted text-sm mb-1">
            A conciliação bancária está disponível apenas no{' '}
            <strong>plano Completo</strong>.
          </p>
          <p className="text-brand-subtle text-xs">
            {plano ? `Plano atual: ${plano.nome}` : 'Sem plano ativo.'}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleArquivo = useCallback(async (file) => {
    setErro('');
    setProcessando(true);
    try {
      const { headers, rows } = await lerArquivo(file);
      if (!rows.length) throw new Error('O arquivo está vazio.');

      setArquivo(file);
      setHeaders(headers);
      setRows(rows);

      // Auto-mapeamento por nome de coluna (heurística simples)
      const achar = (termos) =>
        headers.find((h) =>
          termos.some((t) => h.toLowerCase().includes(t))
        ) || '';

      setMapeamento({
        data: achar(['data', 'date']),
        descricao: achar(['descri', 'históric', 'historic', 'memo', 'lançamento']),
        valor: achar(['valor', 'amount', 'quantia']),
      });

      setPares(null);
    } catch (err) {
      console.error(err);
      setErro('Não foi possível ler o arquivo: ' + err.message);
    } finally {
      setProcessando(false);
    }
  }, []);

  const handleLimpar = () => {
    setArquivo(null);
    setHeaders([]);
    setRows([]);
    setMapeamento({ data: '', descricao: '', valor: '' });
    setPares(null);
    setErro('');
  };

  const podeProcessar =
    arquivo && mapeamento.data && mapeamento.descricao && mapeamento.valor;

  const handleProcessar = () => {
    setErro('');
    if (!podeProcessar) {
      setErro('Preencha o mapeamento de todas as colunas.');
      return;
    }
    const itens = normalizarItens(rows, mapeamento, tipo);
    if (!itens.length) {
      setErro('Nenhum item válido encontrado no arquivo.');
      return;
    }
    const resultado = conciliar(itens, movimentacoes, { toleranciaDias: 1 });
    setPares(resultado.pares);
  };

  const handleConfirmar = async (par) => {
    const res = await confirmarConciliacao(par);
    if (!res.success) {
      setErro(res.error);
      return;
    }
    setPares((prev) =>
      prev.map((p) =>
        p.item.id === par.item.id ? { ...p, status: 'conciliado' } : p
      )
    );
  };

  const handleRejeitar = (par) => {
    setPares((prev) =>
      prev.map((p) =>
        p.item.id === par.item.id ? { ...p, status: 'sem_par', movimentacao: null } : p
      )
    );
  };

  const handleConfirmarTodos = async () => {
    const sugeridos = pares.filter((p) => p.status === 'sugerido');
    for (const par of sugeridos) {
      // eslint-disable-next-line no-await-in-loop
      const res = await confirmarConciliacao(par);
      if (res.success) {
        setPares((prev) =>
          prev.map((p) =>
            p.item.id === par.item.id ? { ...p, status: 'conciliado' } : p
          )
        );
      }
    }
    await registarAuditLog(
      `Conciliou ${sugeridos.length} lançamentos em lote`
    );
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  const sugeridosCount = pares?.filter((p) => p.status === 'sugerido').length || 0;
  const conciliadosCount = pares?.filter((p) => p.status === 'conciliado').length || 0;
  const semParCount = pares?.filter((p) => p.status === 'sem_par').length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Conciliação Bancária</h1>
      <p className="text-brand-muted mb-6">
        Importe o extrato do banco (CSV ou Excel) e confirme as
        correspondências com os lançamentos do sistema.
      </p>

      {erro && (
        <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
          {erro}
        </div>
      )}

      {!empresaAtiva ? (
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <CreditCard className="text-brand-muted mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Nenhuma empresa ativa</h2>
          <p className="text-brand-muted text-sm">
            Selecione uma empresa para começar a conciliação.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 max-w-4xl">
          <UploadArquivo
            onArquivo={handleArquivo}
            arquivoAtual={arquivo}
            onLimpar={handleLimpar}
          />

          {processando && (
            <div className="flex items-center gap-2 text-brand-muted text-sm">
              <Loader2 className="animate-spin" size={16} /> A ler arquivo...
            </div>
          )}

          {arquivo && headers.length > 0 && (
            <>
              <MapeamentoColunas
                headers={headers}
                mapeamento={mapeamento}
                onChange={setMapeamento}
              />

              <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
                <h3 className="font-bold mb-1">Tipo do extrato</h3>
                <p className="text-brand-muted text-xs mb-3">
                  O arquivo contém entradas ou saídas?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('receita')}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition ${
                      tipo === 'receita'
                        ? 'border-brand-green bg-brand-green/10 text-brand-green'
                        : 'border-brand-border text-brand-muted'
                    }`}
                  >
                    Entradas
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('despesa')}
                    className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition ${
                      tipo === 'despesa'
                        ? 'border-brand-red bg-brand-red/10 text-brand-red'
                        : 'border-brand-border text-brand-muted'
                    }`}
                  >
                    Saídas
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProcessar}
                disabled={!podeProcessar}
                className="px-5 py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-40 hover:opacity-90 transition"
              >
                Processar conciliação
              </button>
            </>
          )}

          {pares && (
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <Card titulo="Sugeridos" valor={sugeridosCount} cor="text-yellow-500" />
                <Card titulo="Conciliados" valor={conciliadosCount} cor="text-brand-green" />
                <Card titulo="Sem par" valor={semParCount} cor="text-brand-red" />
              </div>

              <ListaConciliacao
                pares={pares}
                onConfirmar={handleConfirmar}
                onRejeitar={handleRejeitar}
                onConfirmarTodos={handleConfirmarTodos}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-4 text-center">
      <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
      <p className="text-brand-muted text-xs mt-1">{titulo}</p>
    </div>
  );
}