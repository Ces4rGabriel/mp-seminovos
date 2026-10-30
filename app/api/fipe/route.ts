import { NextResponse } from "next/server";

// Proxy da consulta FIPE (API pública da Parallelum, não oficial).
// Cacheado por 24h: a tabela FIPE muda só uma vez por mês.
const BASE = "https://parallelum.com.br/fipe/api/v1/carros/marcas";

function autorizado(request: Request) {
  const senha = request.headers.get("x-admin-senha");
  return !!process.env.ADMIN_PASSWORD && senha === process.env.ADMIN_PASSWORD;
}

async function buscar(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`FIPE respondeu ${res.status}`);
  return res.json();
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const etapa = searchParams.get("etapa");
  const marca = searchParams.get("marca");
  const modelo = searchParams.get("modelo");
  const ano = searchParams.get("ano");

  try {
    if (etapa === "marcas") {
      return NextResponse.json(await buscar(BASE));
    }
    if (etapa === "modelos" && marca) {
      const d = await buscar(`${BASE}/${marca}/modelos`);
      return NextResponse.json(d.modelos ?? []);
    }
    if (etapa === "anos" && marca && modelo) {
      return NextResponse.json(await buscar(`${BASE}/${marca}/modelos/${modelo}/anos`));
    }
    if (etapa === "preco" && marca && modelo && ano) {
      const d = await buscar(`${BASE}/${marca}/modelos/${modelo}/anos/${ano}`);
      return NextResponse.json({
        valor: Number(String(d.Valor).replace(/[^\d,]/g, "").replace(",", ".")),
        valorTexto: d.Valor,
        marca: d.Marca,
        modelo: d.Modelo,
        anoModelo: d.AnoModelo,
        combustivel: d.Combustivel,
        codigoFipe: d.CodigoFipe,
        mesReferencia: d.MesReferencia,
      });
    }
    return NextResponse.json({ erro: "Parâmetros inválidos" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro na consulta FIPE";
    return NextResponse.json({ erro: msg }, { status: 502 });
  }
}
