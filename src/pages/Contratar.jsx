import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

export function Contratar() {
  const [form, setForm] = useState({
    nome_empresa: '',
    nome_fantasia: '',
    cnpj: '',
    segmento: 'Alimentação',
    telefone_empresa: '',
    email_empresa: '',
    endereco: '',
    nome_responsavel: '',
    email_responsavel: '',
    telefone_responsavel: '',
    plano_solicitado: 'Padrão',
    dia_vencimento: 5,
    forma_pagamento: 'PIX',
    nome_operador: '',
    email_operador: '',
    telefone_operador: '',
    observacoes: '',
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      if (!form.nome_empresa.trim())
        throw new Error('Informe o nome da empresa.');
      if (!form.nome_responsavel.trim())
        throw new Error('Informe o nome do responsável.');
      if (!form.email_responsavel.trim())
        throw new Error('Informe o e-mail do responsável.');

      const { error } = await supabase
        .from('pedidos_contratacao')
        .insert([form]);

      if (error) throw error;

      setEnviado(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-darker p-6">
        <div className="w-full max-w-md bg-brand-card border border-brand-green rounded-2xl p-8 text-center">
          <CheckCircle2
            className="text-brand-green mx-auto mb-4"
            size={56}
          />
          <h1 className="text-2xl font-bold mb-2">Pedido enviado!</h1>
          <p className="text-brand-muted text-sm">
            Vamos analisar a sua contratação e entraremos em contacto em até
            24 horas úteis com os dados de acesso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <img
            src="/logo-full.svg"
            alt="MeuGestor"
            className="max-w-[220px] mx-auto mb-3"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-bold mb-1">
            Contratar o MeuGestor
          </h1>
          <p className="text-brand-muted text-sm">
            Preencha os dados abaixo. Entraremos em contacto para ativar o
            acesso.
          </p>
        </div>

        {erro && (
          <div className="bg-brand-red/10 border border-brand-red text-brand-red text-sm rounded-xl px-4 py-3 mb-4">
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="font-bold text-brand-green">1. Empresa</h2>
          <Input
            label="Nome / Razão social"
            value={form.nome_empresa}
            onChange={(e) => handleChange('nome_empresa', e.target.value)}
            required
          />
          <Input
            label="Nome fantasia"
            value={form.nome_fantasia}
            onChange={(e) => handleChange('nome_fantasia', e.target.value)}
          />
          <Input
            label="CNPJ"
            value={form.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
          />
          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-2">
              Segmento
            </label>
            <select
              value={form.segmento}
              onChange={(e) => handleChange('segmento', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
            >
              <option>Alimentação</option>
              <option>Comércio</option>
              <option>Serviços</option>
              <option>Oficina</option>
              <option>Transporte</option>
              <option>Escritório</option>
              <option>Outro</option>
            </select>
          </div>
          <Input
            label="Telefone da empresa"
            value={form.telefone_empresa}
            onChange={(e) =>
              handleChange('telefone_empresa', e.target.value)
            }
          />
          <Input
            label="E-mail da empresa"
            type="email"
            value={form.email_empresa}
            onChange={(e) => handleChange('email_empresa', e.target.value)}
          />
          <Input
            label="Endereço completo"
            value={form.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
          />

          <h2 className="font-bold text-brand-green mt-4">2. Responsável</h2>
          <Input
            label="Nome completo"
            value={form.nome_responsavel}
            onChange={(e) =>
              handleChange('nome_responsavel', e.target.value)
            }
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email_responsavel}
            onChange={(e) =>
              handleChange('email_responsavel', e.target.value)
            }
            required
          />
          <Input
            label="Telefone / WhatsApp"
            value={form.telefone_responsavel}
            onChange={(e) =>
              handleChange('telefone_responsavel', e.target.value)
            }
          />

          <h2 className="font-bold text-brand-green mt-4">3. Contratação</h2>
          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-2">
              Plano escolhido
            </label>
            <select
              value={form.plano_solicitado}
              onChange={(e) =>
                handleChange('plano_solicitado', e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
            >
              <option value="Básico">Básico — R$ 49/mês</option>
              <option value="Padrão">Padrão — R$ 89/mês</option>
              <option value="Completo">Completo — R$ 149/mês</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-2">
              Dia de vencimento
            </label>
            <select
              value={form.dia_vencimento}
              onChange={(e) =>
                handleChange('dia_vencimento', Number(e.target.value))
              }
              className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
            >
              <option value={5}>Dia 5</option>
              <option value={10}>Dia 10</option>
              <option value={15}>Dia 15</option>
              <option value={20}>Dia 20</option>
              <option value={25}>Dia 25</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-2">
              Forma de pagamento
            </label>
            <select
              value={form.forma_pagamento}
              onChange={(e) =>
                handleChange('forma_pagamento', e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
            >
              <option>PIX</option>
              <option>Transferência</option>
              <option>Cartão</option>
              <option>Boleto</option>
            </select>
          </div>

          <h2 className="font-bold text-brand-green mt-4">
            4. Operador (opcional)
          </h2>
          <Input
            label="Nome do operador"
            value={form.nome_operador}
            onChange={(e) =>
              handleChange('nome_operador', e.target.value)
            }
          />
          <Input
            label="E-mail do operador"
            type="email"
            value={form.email_operador}
            onChange={(e) =>
              handleChange('email_operador', e.target.value)
            }
          />
          <Input
            label="Telefone do operador"
            value={form.telefone_operador}
            onChange={(e) =>
              handleChange('telefone_operador', e.target.value)
            }
          />

          <h2 className="font-bold text-brand-green mt-4">5. Observações</h2>
          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-2">
              Alguma coisa que devamos saber?
            </label>
            <textarea
              value={form.observacoes}
              onChange={(e) =>
                handleChange('observacoes', e.target.value)
              }
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#1A2A44] border border-brand-border text-brand-text focus:outline-none focus:border-brand-green"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? 'A enviar...' : 'Enviar pedido de contratação'}
          </Button>
        </form>
      </div>
    </div>
  );
}