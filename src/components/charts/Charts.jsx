import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Cell,
} from 'recharts';
import { formatarMoeda } from '../../utils/formatters';

// ---------------------------------------------------------------
// Paleta (alinhada às cores brand-* do Tailwind)
// ---------------------------------------------------------------
const COR_ENTRADA = '#22C55E'; // brand-green
const COR_SAIDA = '#EF4444';   // brand-red
const COR_SALDO = '#60A5FA';   // azul claro, contrasta com as barras
const COR_GRID = '#2A3A54';
const COR_EIXO = '#8A9AB0';

// ---------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------
function formatarReaisCurto(centavos) {
  const reais = centavos / 100;
  if (Math.abs(reais) >= 1000) {
    return `R$ ${(reais / 1000).toFixed(1)}k`;
  }
  return `R$ ${reais.toFixed(0)}`;
}

function formatarTooltip(valor) {
  return formatarMoeda(valor);
}

// Estilo comum do tooltip
const tooltipStyle = {
  background: '#1A2A44',
  border: '1px solid #2A3A54',
  borderRadius: 12,
  color: '#E6EDF7',
  fontSize: 13,
};

// ---------------------------------------------------------------
// Gráfico de evolução diária: barras (entradas/saídas) + linha (saldo)
// ---------------------------------------------------------------
export function GraficoEvolucaoDiaria({ dados }) {
  if (!dados?.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-brand-muted text-sm">
        Sem dados no período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart
        data={dados}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} />
        <XAxis
          dataKey="label"
          stroke={COR_EIXO}
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis
          stroke={COR_EIXO}
          tick={{ fontSize: 12 }}
          tickFormatter={formatarReaisCurto}
          width={70}
        />
        <Tooltip
          formatter={(valor, nome) => [formatarTooltip(valor), nome]}
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#8A9AB0', marginBottom: 4 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />

        <Bar
          dataKey="entradas"
          name="Entradas"
          fill={COR_ENTRADA}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="saidas"
          name="Saídas"
          fill={COR_SAIDA}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Line
          type="monotone"
          dataKey="saldo"
          name="Saldo acumulado"
          stroke={COR_SALDO}
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: COR_SALDO, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------
// Gráfico de evolução mensal: barras lado a lado
// (mantido como estava no Dashboard; ajustado só o estilo)
// ---------------------------------------------------------------
export function GraficoEvolucaoMensal({ dados }) {
  if (!dados?.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-brand-muted text-sm">
        Sem dados no período.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart
        data={dados}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} />
        <XAxis dataKey="label" stroke={COR_EIXO} tick={{ fontSize: 12 }} />
        <YAxis
          stroke={COR_EIXO}
          tick={{ fontSize: 12 }}
          tickFormatter={formatarReaisCurto}
          width={70}
        />
        <Tooltip
          formatter={(valor, nome) => [formatarTooltip(valor), nome]}
          contentStyle={tooltipStyle}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />

        <Bar
          dataKey="entradas"
          name="Entradas"
          fill={COR_ENTRADA}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="saidas"
          name="Saídas"
          fill={COR_SAIDA}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Line
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke={COR_SALDO}
          strokeWidth={2.5}
          dot={{ r: 3, fill: COR_SALDO, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------
// Top categorias: barras horizontais coloridas
// ---------------------------------------------------------------
export function GraficoTopCategorias({ dados, cor = '#60A5FA' }) {
  if (!dados?.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-brand-muted text-sm">
        Sem dados.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COR_GRID} horizontal={false} />
        <XAxis
          type="number"
          stroke={COR_EIXO}
          tick={{ fontSize: 11 }}
          tickFormatter={formatarReaisCurto}
        />
        <YAxis
          type="category"
          dataKey="categoria"
          stroke={COR_EIXO}
          tick={{ fontSize: 11 }}
          width={120}
        />
        <Tooltip
          formatter={(valor) => [formatarTooltip(valor), 'Total']}
          contentStyle={tooltipStyle}
        />
        <Bar dataKey="valor" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {dados.map((_, i) => (
            <Cell key={i} fill={cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}