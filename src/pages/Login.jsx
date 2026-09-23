import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const senhaAlterada = searchParams.get('senha-alterada') === '1';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.message || 'Erro ao autenticar.');
    } finally {
      setLoading(false);
    }
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

        <h2 className="text-xl font-bold text-center mb-1">Bem-vindo de volta</h2>
        <p className="text-brand-muted text-sm text-center mb-6">
          Acesse a sua conta para gerir as finanças.
        </p>

        {senhaAlterada && (
          <div className="bg-brand-green/10 border border-brand-green text-brand-green text-sm rounded-xl px-4 py-3 mb-4">
            Senha alterada com sucesso. Faça login com a nova senha.
          </div>
        )}

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
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="text-right -mt-2">
            <Link
              to="/esqueci-senha"
              className="text-brand-green text-xs hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Aguarde...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-center text-xs text-brand-subtle mt-6">
          MeuGestor · Gestão financeira simples
        </div>
      </div>
    </div>
  );
}