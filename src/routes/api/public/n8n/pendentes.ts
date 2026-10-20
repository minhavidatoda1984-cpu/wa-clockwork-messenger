import { createFileRoute } from "@tanstack/react-router";
import { autenticarN8n } from "@/lib/n8n-auth.server";

export const Route = createFileRoute("/api/public/n8n/pendentes")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { erro, db } = await autenticarN8n(request);
        if (erro) return erro;
        const { data, error } = await db
          .from("agendamentos")
          .select("*, chip:chips(*), destino:destinos(*)")
          .eq("ativo", true)
          .not("proximo_envio", "is", null)
          .lte("proximo_envio", new Date().toISOString())
          .order("proximo_envio");
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json(data);
      },
    },
  },
});
