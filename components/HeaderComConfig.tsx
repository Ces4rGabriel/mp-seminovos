import { supabase } from "@/lib/supabase";
import Header from "./Header";

export default async function HeaderComConfig() {
  const { data: config } = await supabase
    .from("configuracoes")
    .select("whatsapp")
    .limit(1)
    .maybeSingle();

  const whatsapp = config?.whatsapp || "5531999561226";
  return <Header whatsappUrl={`https://wa.me/${whatsapp}`} />;
}
