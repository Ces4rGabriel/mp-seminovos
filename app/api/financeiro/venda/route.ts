import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// Venda de um veículo do estoque. Cada forma de recebimento vira um lançamento de entrada.
// Carro recebido na troca entra no estoque pelo valor da avaliação e gera uma compra por troca.
// Se o carro recebido vale mais que o combinado, a empresa devolve a diferença (saída).

type Troca = {
  valor: number;
  veiculo: { marca: string; modelo: string; ano: number; placa: string; km: number; cor: string; cambio: string; combustivel: string };
};
type Pagamento = { forma_id: string; valor: number; data: string };

function autorizado(request: Request) {
  const senha = request.headers.get("x-admin-senha");
  return !!process.env.ADMIN_PASSWORD && senha === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const veiculoId: string | undefined = body?.veiculo_id;
  const valorVenda = Number(body?.valor_venda);
  const data: string | undefined = body?.data;
  const trocas: Troca[] = Array.isArray(body?.trocas) ? body.trocas : [];
  const pagamentos: Pagamento[] = Array.isArray(body?.pagamentos) ? body.pagamentos : [];

  if (!veiculoId || !(valorVenda > 0) || !data) {
    return NextResponse.json({ erro: "Informe veículo, valor de venda e data" }, { status: 400 });
  }
  if (trocas.some(t => !(t.valor > 0) || !t.veiculo?.modelo || !t.veiculo?.placa)) {
    return NextResponse.json({ erro: "Cada troca precisa de valor, modelo e placa" }, { status: 400 });
  }
  if (pagamentos.some(p => !(p.valor > 0) || !p.forma_id)) {
    return NextResponse.json({ erro: "Cada pagamento precisa de forma e valor" }, { status: 400 });
  }

  const recebido = trocas.reduce((s, t) => s + Number(t.valor), 0) + pagamentos.reduce((s, p) => s + Number(p.valor), 0);
  const diferenca = Math.round((valorVenda - recebido) * 100) / 100;
  if (diferenca > 0) {
    return NextResponse.json({ erro: `Faltam R$ ${diferenca.toFixed(2)} para fechar a venda` }, { status: 400 });
  }

  const sb = createServiceClient();

  const { data: veiculo, error: erroVeiculo } = await sb.from("veiculos").select("*").eq("id", veiculoId).single();
  if (erroVeiculo || !veiculo) {
    return NextResponse.json({ erro: "Veículo não encontrado" }, { status: 404 });
  }
  if (veiculo.vendido) {
    return NextResponse.json({ erro: "Veículo já foi vendido" }, { status: 400 });
  }

  const [{ data: categorias }, { data: formas }] = await Promise.all([
    sb.from("categorias_financeiras").select("id, nome"),
    sb.from("formas_pagamento").select("id, nome"),
  ]);
  const categoria = (nome: string) => categorias?.find(c => c.nome === nome)?.id ?? null;
  const formaTroca = formas?.find(f => f.nome === "Troca")?.id ?? null;
  const formaNome = (id: string) => formas?.find(f => f.id === id)?.nome ?? "";

  // Carros recebidos na troca entram no estoque antes dos lançamentos.
  const entradasEstoque: { veiculo_id: string; troca: Troca }[] = [];
  for (const troca of trocas) {
    const v = troca.veiculo;
    const { data: novo, error } = await sb
      .from("veiculos")
      .insert({
        marca: v.marca || "Não informada",
        modelo: v.modelo,
        ano: Number(v.ano) || 0,
        km: Number(v.km) || 0,
        preco: 0,
        cor: v.cor ?? "",
        cambio: v.cambio || "Manual",
        combustivel: v.combustivel || "Flex",
        tipo: "Seminovo",
        placa: v.placa,
        vendido: false,
        oculto: true,
      })
      .select("id")
      .single();
    if (error || !novo) {
      return NextResponse.json({ erro: "Erro ao cadastrar carro da troca: " + (error?.message ?? "") }, { status: 500 });
    }
    entradasEstoque.push({ veiculo_id: novo.id, troca });
  }

  const { error: erroUpdate } = await sb
    .from("veiculos")
    .update({ vendido: true, vendido_em: new Date(data).toISOString(), preco: valorVenda })
    .eq("id", veiculoId);
  if (erroUpdate) {
    return NextResponse.json({ erro: erroUpdate.message }, { status: 500 });
  }

  const descVenda = `Venda — ${veiculo.modelo} ${veiculo.placa ?? ""}`.trim();
  const lancamentos: Record<string, unknown>[] = [];

  for (const p of pagamentos) {
    lancamentos.push({
      tipo: "entrada",
      valor: Number(p.valor),
      data: p.data,
      descricao: `${descVenda} (${formaNome(p.forma_id)})`,
      categoria_id: categoria("Venda de veículo"),
      forma_pagamento_id: p.forma_id,
      veiculo_id: veiculoId,
    });
  }

  for (const { troca } of entradasEstoque) {
    lancamentos.push({
      tipo: "entrada",
      valor: Number(troca.valor),
      data,
      descricao: `${descVenda} (troca: ${troca.veiculo.modelo} ${troca.veiculo.placa})`,
      categoria_id: categoria("Venda de veículo"),
      forma_pagamento_id: formaTroca,
      veiculo_id: veiculoId,
    });
  }

  for (const { veiculo_id, troca } of entradasEstoque) {
    lancamentos.push({
      tipo: "saida",
      valor: Number(troca.valor),
      data,
      descricao: `Compra por troca — ${troca.veiculo.modelo} ${troca.veiculo.placa}`,
      categoria_id: categoria("Compra de veículo"),
      forma_pagamento_id: formaTroca,
      veiculo_id,
    });
  }

  if (diferenca < 0) {
    lancamentos.push({
      tipo: "saida",
      valor: -diferenca,
      data,
      descricao: `Devolução de diferença — ${descVenda}`,
      categoria_id: categoria("Outros"),
      forma_pagamento_id: null,
      veiculo_id: veiculoId,
    });
  }

  if (lancamentos.length > 0) {
    const { error } = await sb.from("lancamentos").insert(lancamentos);
    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, devolucao: diferenca < 0 ? -diferenca : 0, carrosNaTroca: entradasEstoque.length }, { status: 201 });
}
