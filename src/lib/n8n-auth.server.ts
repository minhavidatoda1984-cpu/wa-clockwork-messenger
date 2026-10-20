// Valida o header x-api-key contra o token salvo em configuracoes.
export async function autenticarN8n(request: Request) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const token = request.headers.get("x-api-key");
  const { data } = await supabaseAdmin.from("configuracoes").select("n8n_token").eq("id", 1).single();
  if (!token || !data || token !== data.n8n_token) {
    return { erro: Response.json({ error: "Não autorizado" }, { status: 401 }), db: null };
  }
  return { erro: null, db: supabaseAdmin };
}
