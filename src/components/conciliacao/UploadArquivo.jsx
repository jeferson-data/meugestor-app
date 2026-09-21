import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

export function UploadArquivo({ onArquivo, arquivoAtual, onLimpar }) {
  const inputRef = useRef(null);
  const [arrastando, setArrastando] = useState(false);

  const aceitar = '.csv,.xlsx,.xls';

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    onArquivo(file);
  };

  return (
    <div>
      {!arquivoAtual ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition ${
            arrastando
              ? 'border-brand-green bg-brand-green/10'
              : 'border-brand-border hover:border-brand-green/50'
          }`}
        >
          <Upload className="text-brand-green mx-auto mb-3" size={40} />
          <p className="font-bold mb-1">
            Arraste o extrato aqui ou clique para escolher
          </p>
          <p className="text-brand-muted text-sm">
            Formatos aceites: CSV, XLSX, XLS
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={aceitar}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 flex items-center gap-3">
          <FileSpreadsheet className="text-brand-green" size={24} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{arquivoAtual.name}</p>
            <p className="text-brand-muted text-xs">
              {(arquivoAtual.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onLimpar}
            className="text-brand-muted hover:text-brand-red transition"
            aria-label="Remover arquivo"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}