import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AgendamentoForm } from "@/components/AgendamentoForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type Agendamento,
  descreverRepeticao,
  formatarDataHora,
  useAgendamentos,
  useChips,
  useDestinos,
  useExcluir,
  useSalvar,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/agendamentos")({
  head: () => ({
    meta: [
      { title: "Agendamentos — Disparador WhatsApp" },
      { name: "description", content: "Lista de mensagens de WhatsApp agendadas." },
      { property: "og:title", content: "Agendamentos — Disparador WhatsApp" },
      { property: "og:description", content: "Lista de mensagens de WhatsApp agendadas." },
    ],
  }),
  component: AgendamentosPage,
});

function AgendamentosPage() {
  const { data: ags = [], isLoading } = useAgendamentos();
  const { data: chips = [] } = useChips();
  const { data: destinos = [] } = useDestinos();
  const salvar = useSalvar("agendamentos");
  const excluir = useExcluir("agendamentos");
  const [filtroChip, setFiltroChip] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [editando, setEditando] = useState<Agendamento | null | undefined>(undefined);

  const chipNome = (id: string | null) => chips.find((c) => c.id === id)?.nome;
  const destino = (id: string | null) => destinos.find((d) => d.id === id);

  const lista = ags.filter(
    (a) =>
      (filtroChip === "todos" || (filtroChip === "sem" ? !a.chip_id : a.chip_id === filtroChip)) &&
      (filtroStatus === "todos" || (filtroStatus === "ativo" ? a.ativo : !a.ativo)),
  );

  return (
    <>
      <PageHeader titulo="Agendamentos" descricao="Mensagens programadas para disparo pelo n8n.">
        <Button onClick={() => setEditando(null)}>
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filtroChip} onValueChange={setFiltroChip}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os chips</SelectItem>
            <SelectItem value="sem">Sem chip definido</SelectItem>
            {chips.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="pausado">Pausados</SelectItem>
          </SelectContent>
        </Select>
        <span className="self-center text-sm text-muted-foreground">{lista.length} agendamento(s)</span>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : lista.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nenhum agendamento encontrado.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((a) => {
            const d = destino(a.destino_id);
            return (
              <div key={a.id} className={`flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center ${a.ativo ? "" : "opacity-60"}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{a.titulo || "Sem título"}</h3>
                    <Badge variant={a.ativo ? "success" : "muted"}>{a.ativo ? "Ativo" : "Pausado"}</Badge>
                    <Badge variant="outline">{descreverRepeticao(a)}</Badge>
                  </div>
                  {a.usar_texto && a.texto && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.texto}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>📱 {a.usar_chip ? chipNome(a.chip_id) ?? "—" : "qualquer chip"}</span>
                    <span>{d?.tipo === "grupo" ? "👥" : "👤"} {a.usar_destino ? d?.nome ?? "—" : "sem destino"}</span>
                    <span>🕒 {a.usar_horario ? a.horario?.slice(0, 5) : "sem horário"}</span>
                    <span>Próximo: <b className="text-foreground">{formatarDataHora(a.proximo_envio)}</b></span>
                    <span>Último: {formatarDataHora(a.ultimo_envio)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => salvar.mutate({ id: a.id, ativo: !a.ativo })}>
                    {a.ativo ? <><Pause className="h-3.5 w-3.5" /> Pausar</> : <><Play className="h-3.5 w-3.5" /> Ativar</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditando(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => confirm("Excluir este agendamento?") && excluir.mutate(a.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={editando !== undefined} onOpenChange={(o) => !o && setEditando(undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar agendamento" : "Novo agendamento"}</DialogTitle>
          </DialogHeader>
          {editando !== undefined && (
            <AgendamentoForm key={editando?.id ?? "novo"} {...(editando ? { inicial: editando } : {})} onSalvo={() => setEditando(undefined)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
