import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatarDataHora, resumirResposta, useChips, useDestinos, useEnvios } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/envios")({
  head: () => ({
    meta: [
      { title: "Envios — Disparador WhatsApp" },
      { name: "description", content: "Histórico e status dos envios de mensagens." },
      { property: "og:title", content: "Envios — Disparador WhatsApp" },
      { property: "og:description", content: "Histórico e status dos envios de mensagens." },
    ],
  }),
  component: EnviosPage,
});

const mesmoDiaSP = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) ===
  new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function EnviosPage() {
  const { data: envios = [], isLoading, isFetching, refetch } = useEnvios();
  const { data: chips = [] } = useChips();
  const { data: destinos = [] } = useDestinos();
  const [filtro, setFiltro] = useState("todos");

  const hoje = envios.filter((e) => mesmoDiaSP(e.enviado_em));
  const okHoje = hoje.filter((e) => e.sucesso).length;
  const falhasHoje = hoje.length - okHoje;
  const lista = envios.filter((e) => filtro === "todos" || (filtro === "ok" ? e.sucesso : !e.sucesso));

  return (
    <>
      <PageHeader titulo="Envios" descricao="Status de cada tentativa de envio feita pelo n8n. Atualiza sozinho a cada 15 segundos.">
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </PageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 md:max-w-md">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Enviados hoje</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold"><CheckCircle2 className="h-5 w-5 text-success" /> {okHoje}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Falhas hoje</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold"><XCircle className="h-5 w-5 text-destructive" /> {falhasHoje}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ok">Só enviados</SelectItem>
            <SelectItem value="falha">Só falhas</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{lista.length} registro(s)</span>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : lista.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nenhum envio registrado ainda.</div>
      ) : (
        <div className="space-y-2">
          {lista.map((e) => {
            const ag = e.agendamentos;
            const chip = chips.find((c) => c.id === ag?.chip_id)?.nome;
            const dest = destinos.find((d) => d.id === ag?.destino_id)?.nome;
            return (
              <div key={e.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3 md:flex-row md:items-center">
                <div className="flex w-44 shrink-0 flex-col gap-1">
                  <Badge variant={e.sucesso ? "success" : "destructive"} className="w-fit">
                    {e.sucesso ? "✔ Enviado" : "✖ Falhou"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatarDataHora(e.enviado_em)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ag?.titulo || "Agendamento removido"}</p>
                  <p className="text-xs text-muted-foreground">
                    📱 {chip ?? "—"} · 👤 {dest ?? "—"}
                  </p>
                  <p className={`mt-1 text-sm ${e.sucesso ? "text-muted-foreground" : "text-destructive"}`}>{resumirResposta(e)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
