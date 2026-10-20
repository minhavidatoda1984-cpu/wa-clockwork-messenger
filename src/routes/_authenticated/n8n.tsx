import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/n8n")({
  head: () => ({
    meta: [
      { title: "Integração n8n — Disparador WhatsApp" },
      { name: "description", content: "Como o n8n lê e confirma os envios agendados." },
      { property: "og:title", content: "Integração n8n — Disparador WhatsApp" },
      { property: "og:description", content: "Como o n8n lê e confirma os envios agendados." },
    ],
  }),
  component: N8nPage,
});

function N8nPage() {
  const [origem, setOrigem] = useState("");
  useEffect(() => setOrigem(window.location.origin), []);
  const { data: token } = useQuery({
    queryKey: ["config"],
    queryFn: async () => (await supabase.from("configuracoes").select("n8n_token").single()).data?.n8n_token ?? "",
  });
  const copiar = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copiado"); };

  return (
    <>
      <PageHeader titulo="Integração n8n" descricao="O n8n consulta os pendentes periodicamente e confirma cada envio." />
      <div className="space-y-4">
        <Card titulo="Chave de acesso (header x-api-key)">
          <div className="flex gap-2">
            <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-sm">{token || "…"}</code>
            <Button variant="secondary" onClick={() => token && copiar(token)}><Copy className="h-4 w-4" /></Button>
          </div>
        </Card>
        <Card titulo="1. Buscar pendentes — GET">
          <code className="block rounded bg-muted px-3 py-2 text-sm">{origem}/api/public/n8n/pendentes</code>
          <p className="mt-2 text-sm text-muted-foreground">
            Retorna agendamentos ativos cujo horário já chegou, com os dados do chip (evolution_url, instancia, api_key) e do destino (tipo, identificador).
          </p>
        </Card>
        <Card titulo="2. Confirmar envio — POST">
          <code className="block rounded bg-muted px-3 py-2 text-sm">{origem}/api/public/n8n/enviado</code>
          <pre className="mt-2 rounded bg-muted p-3 text-xs">{`{ "id": "<id do agendamento>", "sucesso": true, "resposta": "opcional" }`}</pre>
          <p className="mt-2 text-sm text-muted-foreground">
            O próximo horário é recalculado automaticamente conforme a repetição. Envios únicos deixam de aparecer.
          </p>
        </Card>
      </div>
    </>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 font-semibold">{titulo}</h2>
      {children}
    </div>
  );
}
