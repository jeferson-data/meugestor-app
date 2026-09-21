import React from 'react';

/**
 * Permite o usuário escolher qual coluna do arquivo é data, descrição e valor.
 * Como bancos variam muito, isso evita ter que adivinhar o layout.
 */
export function MapeamentoColunas({ headers, mapeamento, onChange }) {
  const campos = [
    { key: 'data', label: 'Data' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'valor', label: 'Valor' },
  ];

  const selectCls =
    'w-full px-3 py-2 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green text-sm';

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h3 className="font-bold mb-1">Mapear colunas do arquivo</h3>
      <p className="text-brand-muted text-xs mb-4">
        Indique qual coluna do seu extrato corresponde a cada campo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {campos.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-brand-muted mb-1">
              {label}
            </label>
            <select
              value={mapeamento[key] || ''}
              onChange={(e) => onChange({ ...mapeamento, [key]: e.target.value })}
              className={selectCls}
            >
              <option value="">— escolher —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}