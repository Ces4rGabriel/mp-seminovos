import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Notas fiscais ficam num bucket privado. O banco guarda só o caminho do arquivo,
// e a visualização gera um link temporário (1 hora).
const BUCKET = "notas-fiscais";
const TIPOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function autorizado(request: Request) {
  const senha = request.headers.get("x-admin-senha");
  return !!process.env.ADMIN_PASSWORD && senha === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const arquivo = form?.get("arquivo");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Arquivo não enviado" }, { status: 400 });
  }
  if (!TIPOS.includes(arquivo.type)) {
    return NextResponse.json({ erro: "Use PDF, JPG, PNG ou WEBP" }, { status: 400 });
  }
  if (arquivo.size > MAX_BYTES) {
    return NextResponse.json({ erro: "Arquivo acima de 10 MB" }, { status: 400 });
  }

  const nomeLimpo = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const caminho = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${nomeLimpo}`;

  const sb = createServiceClient();
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(caminho, Buffer.from(await arquivo.arrayBuffer()), { contentType: arquivo.type });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: caminho }, { status: 201 });
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const caminho = new URL(request.url).searchParams.get("path");
  if (!caminho) {
    return NextResponse.json({ erro: "Caminho obrigatório" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(caminho, 3600);
  if (error || !data) {
    return NextResponse.json({ erro: error?.message ?? "Arquivo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
