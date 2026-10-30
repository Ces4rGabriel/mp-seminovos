import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Grava a última consulta FIPE no veículo (valor, código e data da consulta).
function autorizado(request: Request) {
  const senha = request.headers.get("x-admin-senha");
  return !!process.env.ADMIN_PASSWORD && senha === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const valor = Number(body?.valor);

  if (!body?.veiculo_id || !body?.codigo_fipe || !Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json({ erro: "Dados da consulta inválidos" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { error } = await sb
    .from("veiculos")
    .update({
      fipe_codigo: body.codigo_fipe,
      fipe_valor: valor,
      fipe_consultado_em: new Date().toISOString(),
    })
    .eq("id", body.veiculo_id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
