import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    // O redirectTo precisa estar cadastrado em
    // Supabase → Authentication → URL Configuration → Redirect URLs
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);

    if (error) {
      setErro('Não foi possível enviar o e-mail. Verifique o endereço.');
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darker p-6">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <div className="flex justify-center mb-6">
          <img
            src="/logo-full.svg"
            alt="MeuGestor"
            className="w-full max-w-[240px]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {enviado ? (
          <>
            <h2 className="text-xl font-bold text-center mb-2">
              Verifique seu e-mail
            </h2>
            <p className="text-brand-muted text-sm text-center mb-4">
              Se existir uma conta com o e-mail <strong>{email}</strong>,
              você receberá um link para criar uma nova senha.
            </p>
            <p className="text-brand-subtle text-xs text-center mb-6">
              Não chegou? Verifique a caixa de spam. O link expira em 60 minutos.
            </p>
            <div className="text-center">
              <Link
                to="/login"
                className="text-brand-green text-sm font-semibold hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-1">
              Esqueci minha senha
            </h2>
            <p className="text-brand-muted text-sm text-center mb-6">
              Informe o e-mail da sua conta. Enviaremos um link para criar uma
              nova senha.
            </p>

            {erro && (
              <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'A enviar...' : 'Enviar link de redefinição'}
              </Button>
            </form>

            <div className="text-center text-xs text-brand-subtle mt-6">
              <Link to="/login" className="hover:text-brand-text">
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}