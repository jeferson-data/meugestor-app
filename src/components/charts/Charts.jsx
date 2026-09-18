import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { formatarMoeda } from '../../utils/formatters';

// Cores do sistema
const GREEN = '#00DFA2';
const RED = '#FF6B6B';
const BLUE = '#4A8BFF';
const BORDER = '#253B5C';

// Tooltip personalizado
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-dark border border-brand-border rounded-lg p-3 text-xs">
      <div className="font-bold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-semibold">{formatarMoeda(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Evolução diária (linhas) ----------
export function GraficoEvolucaoDiaria({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
        <XAxis dataKey="label" stroke="#8FA4C8" fontSize={11} />
        <YAxis
          stroke="#8FA4C8"
          fontSize={11}
          tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="entradas" name="Entradas" stroke={GREEN} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="saidas" name="Saídas" stroke={RED} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="saldo" name="Saldo" stroke={BLUE} strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- Evolução mensal (barras) ----------
export function GraficoEvolucaoMensal({ dados }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
        <XAxis dataKey="label" stroke="#8FA4C8" fontSize={11} />
        <YAxis
          stroke="#8FA4C8"
          fontSize={11}
          tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="entradas" name="Entradas" fill={GREEN} radius={[6, 6, 0, 0]} />
        <Bar dataKey="saidas" name="Saídas" fill={RED} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Top categorias (barras horizontais) ----------
export function GraficoTopCategorias({ dados, cor = GREEN }) {
  if (!dados?.length) {
    return (
      <div className="text-center text-brand-muted text-sm py-8">
        Sem dados para mostrar.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, dados.length * 32)}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
        <XAxis
          type="number"
          stroke="#8FA4C8"
          fontSize={11}
          tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
        />
        <YAxis
          type="category"
          dataKey="categoria"
          stroke="#8FA4C8"
          fontSize={11}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="valor" name="Valor" radius={[0, 6, 6, 0]}>
          {dados.map((_, i) => (
            <Cell key={i} fill={cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}