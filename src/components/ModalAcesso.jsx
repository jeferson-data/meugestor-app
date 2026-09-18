import React, { useState } from 'react';
import { CheckCircle2, Copy, X } from 'lucide-react';
import { Button } from './ui/Button';

export function ModalAcesso({ dados, onFechar }) {
  const [copiado, setCopiado] = useState(false);

  if (!dados) return null;

  const mensagem = `Olá ${dados.dono_nome}!

O acesso ao MeuGestor está pronto:

🔗 Link: ${window.location.origin}/login
🏢 Empresa: ${dados.empresa_nome}
👤 E-mail: ${dados.dono_email}
🔑 Senha provisória: ${dados.senha_provisoria}

Recomendamos alterar a senha após o primeiro acesso.

Qualquer dúvida, estou à disposição.`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      alert('Não foi possível copiar. Selecione o texto manualmente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-brand-card border border-brand-green rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-brand-green" size={32} />
            <h2 className="text-xl font-bold">Acesso criado!</h2>
          </div>
          <button
            onClick={onFechar}
            className="text-brand-muted hover:text-brand-red"
          >
            <X size={22} />
          </button>
        </div>

        <p className="text-brand-muted text-sm mb-4">
          Copie a mensagem abaixo e envie ao cliente por WhatsApp ou e-mail.
        </p>

        <div className="bg-brand-darker border border-brand-border rounded-xl p-4 mb-4 text-sm text-brand-text whitespace-pre-wrap font-mono">
          {mensagem}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onFechar}
          >
            Fechar
          </Button>
          <Button
            className="flex-1 flex items-center justify-center gap-2"
            onClick={copiar}
          >
            <Copy size={16} />
            {copiado ? 'Copiado!' : 'Copiar mensagem'}
          </Button>
        </div>
      </div>
    </div>
  );
}