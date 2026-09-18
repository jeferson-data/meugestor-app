import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export function PainelAnalise({ analise }) {
  if (!analise) return null;

  const { nivel, resumo, alertas, recomendacoes, metricas } = analise;

  // Configuração visual por nível
  const nivelConfig = {
    otimo: {
      cor: 'border-brand-green bg-brand-green/5',
      icone: <CheckCircle2 className="text-brand-green" size={28} />,
      titulo: 'Saúde financeira ótima',
      corTitulo: 'text-brand-green',
    },
    bom: {
      cor: 'border-brand-green bg-brand-green/5',
      icone: <CheckCircle2 className="text-brand-green" size={28} />,
      titulo: 'Saúde financeira estável',
      corTitulo: 'text-brand-green',
    },
    atencao: {
      cor: 'border-yellow-500 bg-yellow-500/5',
      icone: <AlertTriangle className="text-yellow-500" size={28} />,
      titulo: 'Atenção necessária',
      corTitulo: 'text-yellow-500',
    },
    critico: {
      cor: 'border-brand-red bg-brand-red/5',
      icone: <AlertCircle className="text-brand-red" size={28} />,
      titulo: 'Situação crítica',
      corTitulo: 'text-brand-red',
    },
    'sem-dados': {
      cor: 'border-brand-border bg-brand-card',
      icone: <Lightbulb className="text-brand-muted" size={28} />,
      titulo: 'Sem dados ainda',
      corTitulo: 'text-brand-muted',
    },
  };

  const config = nivelConfig[nivel] || nivelConfig['sem-dados'];

  return (
    <div className="mb-8">
      {/* Cabeçalho com resumo */}
      <div className={`border-l-4 rounded-xl p-5 mb-4 ${config.cor}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">{config.icone}</div>
          <div className="flex-1">
            <h2 className={`text-lg font-bold mb-1 ${config.corTitulo}`}>
              {config.titulo}
            </h2>
            <p className="text-brand-text text-sm leading-relaxed">{resumo}</p>
          </div>
        </div>
      </div>

      {/* Variações vs mês anterior */}
      {(metricas.varReceita !== null || metricas.varDespesa !== null) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metricas.varReceita !== null && (
            <div className="bg-brand-card border border-brand-border rounded-xl p-3 flex items-center gap-3">
              {metricas.varReceita >= 0 ? (
                <TrendingUp className="text-brand-green" size={20} />
              ) : (
                <TrendingDown className="text-brand-red" size={20} />
              )}
              <div>
                <div className="text-xs text-brand-muted">Receitas vs mês anterior</div>
                <div className={`font-bold ${metricas.varReceita >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {metricas.varReceita >= 0 ? '+' : ''}
                  {metricas.varReceita.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
          {metricas.varDespesa !== null && (
            <div className="bg-brand-card border border-brand-border rounded-xl p-3 flex items-center gap-3">
              {metricas.varDespesa <= 0 ? (
                <TrendingDown className="text-brand-green" size={20} />
              ) : (
                <TrendingUp className="text-brand-red" size={20} />
              )}
              <div>
                <div className="text-xs text-brand-muted">Despesas vs mês anterior</div>
                <div className={`font-bold ${metricas.varDespesa <= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {metricas.varDespesa >= 0 ? '+' : ''}
                  {metricas.varDespesa.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 mb-4">
          <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-500" /> Pontos de atenção
          </h3>
          <ul className="flex flex-col gap-2">
            {alertas.map((a, i) => (
              <li
                key={i}
                className={`text-sm flex items-start gap-2 ${
                  a.tipo === 'critico' ? 'text-brand-red' : 'text-yellow-500'
                }`}
              >
                <span className="mt-1">•</span>
                <span className="text-brand-text">{a.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendações */}
      {recomendacoes.length > 0 && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5">
          <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
            <Lightbulb size={18} className="text-brand-green" /> Recomendações
          </h3>
          <ul className="flex flex-col gap-2">
            {recomendacoes.map((r, i) => (
              <li key={i} className="text-sm text-brand-text flex items-start gap-2">
                <span className="text-brand-green mt-1">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}