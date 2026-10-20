import { createFileRoute } from "@tanstack/react-router";
import { autenticarN8n } from "@/lib/n8n-auth.server";

export const Route = createFileRoute("/api/public/n8n/enviado")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { erro, db } = await autenticarN8n(request);
        if (erro) return erro;
        const body = (await request.json().catch(() => null)) as
          | { id?: string; sucesso?: boolean; resposta?: string }
          | null;
        if (!body?.id) return Response.json({ error: "Informe id" }, { status: 400 });
        const sucesso = body.sucesso !== false;
        await db.from("envios").insert({ agendamento_id: body.id, sucesso, resposta: body.resposta ?? null });
        if (sucesso) {
          const { error } = await db.from("agendamentos").update({ ultimo_envio: new Date().toISOString() }).eq("id", body.id);
          if (error) return Response.json({ error: error.message }, { status: 500 });
        }
        const { data } = await db.from("agendamentos").select("id, proximo_envio").eq("id", body.id).single();
        return Response.json({ ok: true, ...data });
      },
    },
  },
});
