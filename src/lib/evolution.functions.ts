import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Consulta o estado da instância na Evolution API e grava o status do chip.
export const verificarConexaoChip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { chipId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: chip, error } = await context.supabase
      .from("chips")
      .select("*")
      .eq("id", data.chipId)
      .single();
    if (error || !chip) throw new Error("Chip não encontrado");
    if (!chip.instancia || !chip.evolution_url) throw new Error("Preencha URL e instância");

    let status: "conectado" | "desconectado" = "desconectado";
    let detalhe = "";
    try {
      const url = `${chip.evolution_url.replace(/\/$/, "")}/instance/connectionState/${encodeURIComponent(chip.instancia)}`;
      const res = await fetch(url, { headers: chip.api_key ? { apikey: chip.api_key } : {} });
      const body = (await res.json().catch(() => ({}))) as { instance?: { state?: string } };
      const state = body.instance?.state ?? `HTTP ${res.status}`;
      detalhe = state;
      if (state === "open") status = "conectado";
    } catch (e) {
      detalhe = e instanceof Error ? e.message : "erro";
    }
    await context.supabase
      .from("chips")
      .update({ status, status_atualizado_em: new Date().toISOString() })
      .eq("id", chip.id);
    return { status, detalhe };
  });
