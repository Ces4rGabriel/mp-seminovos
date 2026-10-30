import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Acesso ao caixa exige a senha do admin no cabeçalho x-admin-senha.
// O banco é lido com a service role, que só existe no servidor.
function autorizado(request: Request) {
  const senha = request.headers.get("x-admin-senha");
  return !!process.env.ADMIN_PASSWORD && senha === process.env.ADMIN_PASSWORD;
}

type LancamentoRow = {
  tipo: "entrada" | "saida";
  valor: number | string;
  data: string;
};

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const sb = createServiceClient();

  const [todos, recentes, cats, formas, veic] = await Promise.all([
    sb.from("lancamentos").select("tipo, valor, data"),
    sb
      .from("lancamentos")
      .select("*, categorias_financeiras(nome), formas_pagamento(nome), veiculos(placa, marca, modelo)")
      .order("data", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(300),
    sb.from("categorias_financeiras").select("id, nome, tipo").eq("ativo", true).order("nome"),
    sb.from("formas_pagamento").select("id, nome").eq("ativo", true).order("nome"),
    sb.from("veiculos_financeiro").select("*").order("modelo"),
  ]);

  const erro = todos.error || recentes.error || cats.error || formas.error || veic.error;
  if (erro) {
    return NextResponse.json({ erro: erro.message }, { status: 500 });
  }

  const mesAtual = new Date().toISOString().slice(0, 7);
  const linhas = (todos.data ?? []) as LancamentoRow[];

  let entradas = 0;
  let saidas = 0;
  let entradasMes = 0;
  let saidasMes = 0;
  for (const l of linhas) {
    const valor = Number(l.valor);
    const doMes = l.data.startsWith(mesAtual);
    if (l.tipo === "entrada") {
      entradas += valor;
      if (doMes) entradasMes += valor;
    } else {
      saidas += valor;
      if (doMes) saidasMes += valor;
    }
  }

  const veiculos = (veic.data ?? []).map((v) => ({
    ...v,
    valor_venda_previsto: Number(v.valor_venda_previsto),
    fipe_valor: v.fipe_valor === null ? null : Number(v.fipe_valor),
    custo_total: Number(v.custo_total),
    valor_recebido: Number(v.valor_recebido),
    resultado: Number(v.resultado),
  }));

  const emEstoque = veiculos.filter((v) => !v.vendido);
  const vendidos = veiculos.filter((v) => v.vendido);

  return NextResponse.json({
    resumo: {
      mes: mesAtual,
      saldo: entradas - saidas,
      entradasMes,
      saidasMes,
      resultadoMes: entradasMes - saidasMes,
    },
    estoque: {
      quantidade: emEstoque.length,
      capitalInvestido: emEstoque.reduce((s, v) => s + v.custo_total, 0),
      valorVendaPrevisto: emEstoque.reduce((s, v) => s + v.valor_venda_previsto, 0),
      lucroPrevisto: emEstoque.reduce((s, v) => s + (v.valor_venda_previsto - v.custo_total), 0),
      lucroRealizado: vendidos.reduce((s, v) => s + v.resultado, 0),
    },
    lancamentos: recentes.data ?? [],
    categorias: cats.data ?? [],
    formas: formas.data ?? [],
    veiculos,
  });
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const valor = Number(body.valor);
  const descricao = String(body.descricao ?? "").trim();

  if (body.tipo !== "entrada" && body.tipo !== "saida") {
    return NextResponse.json({ erro: "Tipo deve ser entrada ou saída" }, { status: 400 });
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json({ erro: "Valor deve ser maior que zero" }, { status: 400 });
  }
  if (!descricao) {
    return NextResponse.json({ erro: "Descrição é obrigatória" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lancamentos")
    .insert({
      tipo: body.tipo,
      valor,
      data: body.data || new Date().toISOString().slice(0, 10),
      descricao,
      categoria_id: body.categoria_id || null,
      forma_pagamento_id: body.forma_pagamento_id || null,
      veiculo_id: body.veiculo_id || null,
      nota_fiscal_url: body.nota_fiscal_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
