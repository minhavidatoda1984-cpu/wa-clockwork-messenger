import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Chip, useChips, useExcluir, useSalvar, formatarDataHora } from "@/lib/data";
import { verificarConexaoChip } from "@/lib/evolution.functions";

export const Route = createFileRoute("/_authenticated/chips")({
  head: () => ({
    meta: [
      { title: "Chips — Disparador WhatsApp" },
      { name: "description", content: "Números de WhatsApp conectados via Evolution API." },
      { property: "og:title", content: "Chips — Disparador WhatsApp" },
      { property: "og:description", content: "Números de WhatsApp conectados via Evolution API." },
    ],
  }),
  component: ChipsPage,
});

const vazio = {
  nome: "",
  numero: "",
  evolution_url: "https://evolution.naturaisterravida.com.br",
  instancia: "",
  api_key: "",
};

function ChipsPage() {
  const { data: chips = [], isLoading } = useChips();
  const salvar = useSalvar("chips");
  const excluir = useExcluir("chips");
  const verificar = useServerFn(verificarConexaoChip);
  const qc = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<typeof vazio & { id?: string }>(vazio);
  const [verificando, setVerificando] = useState<string | null>(null);

  function editar(c?: Chip) {
    setForm(c ? { id: c.id, nome: c.nome, numero: c.numero, evolution_url: c.evolution_url, instancia: c.instancia, api_key: c.api_key ?? "" } : vazio);
    setAberto(true);
  }

  async function checar(id: string) {
    setVerificando(id);
    try {
      const r = await verificar({ data: { chipId: id } });
      toast[r.status === "conectado" ? "success" : "warning"](`Status: ${r.status} (${r.detalhe})`);
      qc.invalidateQueries({ queryKey: ["chips"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao verificar");
    } finally {
      setVerificando(null);
    }
  }

  return (
    <>
      <PageHeader titulo="Chips" descricao="Números de WhatsApp e suas instâncias na Evolution API.">
        <Button onClick={() => editar()}>
          <Plus className="h-4 w-4" /> Novo chip
        </Button>
      </PageHeader>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : chips.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Nenhum chip cadastrado.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chips.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{c.nome}</h3>
                  <p className="text-sm text-muted-foreground">{c.numero || "sem número"}</p>
                </div>
                <Badge variant={c.status === "conectado" ? "success" : "muted"}>{c.status}</Badge>
              </div>
              <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="truncate">Instância: <span className="text-foreground">{c.instancia || "—"}</span></div>
                <div className="truncate">{c.evolution_url}</div>
                <div>Verificado: {formatarDataHora(c.status_atualizado_em)}</div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => checar(c.id)} disabled={verificando === c.id}>
                  <RefreshCw className={`h-3.5 w-3.5 ${verificando === c.id ? "animate-spin" : ""}`} /> Verificar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => editar(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirm(`Excluir ${c.nome}?`) && excluir.mutate(c.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar chip" : "Novo chip"}</DialogTitle>
          </DialogHeader>
          <form
            id="chip-form"
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              salvar.mutate({ ...form, api_key: form.api_key || null }, {
                onSuccess: () => { setAberto(false); toast.success("Chip salvo"); },
              });
            }}
          >
            <Campo label="Nome identificador" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required placeholder="Chip Vendas 01" />
            <Campo label="Número" value={form.numero} onChange={(v) => setForm({ ...form, numero: v })} placeholder="5511999999999" />
            <Campo label="Endpoint da Evolution API" value={form.evolution_url} onChange={(v) => setForm({ ...form, evolution_url: v })} required />
            <Campo label="Nome da instância" value={form.instancia} onChange={(v) => setForm({ ...form, instancia: v })} required />
            <Campo label="API key da instância (opcional)" value={form.api_key} onChange={(v) => setForm({ ...form, api_key: v })} type="password" />
          </form>
          <DialogFooter>
            <Button type="submit" form="chip-form" disabled={salvar.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Campo({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}
