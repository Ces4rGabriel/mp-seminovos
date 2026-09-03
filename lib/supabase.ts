import { createClient } from "@supabase/supabase-js";

export type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  km: number;
  preco: number;
  fipe_preco: number | null;
  cor: string;
  cambio: "Manual" | "Automático" | "CVT";
  combustivel: "Flex" | "Gasolina" | "Diesel" | "Elétrico" | "Híbrido";
  descricao: string | null;
  opcionais: string[];
  fotos: string[];
  tipo: "Seminovo" | "Zero km";
  destaque: boolean;
  vendido: boolean;
  vendido_em: string | null;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
