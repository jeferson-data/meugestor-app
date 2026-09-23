import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // Ao abrir o link do e-mail, o Supabase cria uma sessão temporária.
  // Se não houver sessão, o link expirou ou é inválido.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessaoValida(!!session);
      setVerificando(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (error) {
      setErro('Não foi possível alterar a senha. O link pode ter expirado.');
      return;
    }

    // Encerra a sessão temporária e volta para o login
    await supabase.auth.signOut();
    navigate('/login?senha-alterada=1');
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

        {verificando ? (
          <p className="text-brand-muted text-sm text-center">
            A validar link...
          </p>
        ) : !sessaoValida ? (
          <>
            <h2 className="text-xl font-bold text-center mb-2">
              Link inválido
            </h2>
            <p className="text-brand-muted text-sm text-center mb-6">
              Este link expirou ou já foi usado. Solicite um novo para
              continuar.
            </p>
            <div className="text-center">
              <Link
                to="/esqueci-senha"
                className="text-brand-green text-sm font-semibold hover:underline"
              >
                Pedir novo link
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-center mb-1">
              Criar nova senha
            </h2>
            <p className="text-brand-muted text-sm text-center mb-6">
              Escolha uma senha nova para acessar sua conta.
            </p>

            {erro && (
              <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nova senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'A guardar...' : 'Salvar nova senha'}
              </Button>
            </form>
          </>
        )}

        <div className="text-center text-xs text-brand-subtle mt-6">
          MeuGestor · Gestão financeira simples
        </div>
      </div>
    </div>
  );
}