export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string | null;
          role: string;
          ativo: boolean | null;
          criado_em: string | null;
          comissao_percentual: number | null;
          anonimizado_em: string | null;
          motivo_exclusao: string | null;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          telefone?: string | null;
          role?: string;
          ativo?: boolean | null;
          criado_em?: string | null;
          comissao_percentual?: number | null;
          anonimizado_em?: string | null;
          motivo_exclusao?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string | null;
          role?: string;
          ativo?: boolean | null;
          criado_em?: string | null;
          comissao_percentual?: number | null;
          anonimizado_em?: string | null;
          motivo_exclusao?: string | null;
        };
        Relationships: [];
      };
      user_empresas: {
        Row: {
          id: string;
          usuario_id: string;
          empresa_id: string;
          papel: string;
          criado_em: string | null;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          empresa_id: string;
          papel?: string;
          criado_em?: string | null;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          empresa_id?: string;
          papel?: string;
          criado_em?: string | null;
        };
        Relationships: [];
      };
      empresas: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          status_acesso: string;
          criado_em: string | null;
          nome_fantasia: string | null;
          vendedor_id: string | null;
          arquivada_em: string | null;
          expurgo_em: string | null;
          motivo_exclusao: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          telefone?: string | null;
          email?: string | null;
          endereco?: string | null;
          status_acesso?: string;
          criado_em?: string | null;
          nome_fantasia?: string | null;
          vendedor_id?: string | null;
          arquivada_em?: string | null;
          expurgo_em?: string | null;
          motivo_exclusao?: string | null;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string | null;
          telefone?: string | null;
          email?: string | null;
          endereco?: string | null;
          status_acesso?: string;
          criado_em?: string | null;
          nome_fantasia?: string | null;
          vendedor_id?: string | null;
          arquivada_em?: string | null;
          expurgo_em?: string | null;
          motivo_exclusao?: string | null;
        };
        Relationships: [];
      };
      empresa_vendedores: {
        Row: {
          id: string;
          empresa_id: string;
          vendedor_id: string;
          ativo: boolean | null;
          principal: boolean | null;
          criado_em: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          vendedor_id: string;
          ativo?: boolean | null;
          principal?: boolean | null;
          criado_em?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          vendedor_id?: string;
          ativo?: boolean | null;
          principal?: boolean | null;
          criado_em?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
