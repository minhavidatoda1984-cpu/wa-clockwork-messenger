import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Agendamento, useChips, useDestinos, useSalvar } from "@/lib/data";

function hojeSP() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export function AgendamentoForm({ inicial, onSalvo }: { inicial?: Agendamento; onSalvo: () => void }) {
  const { data: chips = [] } = useChips();
  const { data: destinos = [] } = useDestinos();
  const salvar = useSalvar("agendamentos");
  const [f, setF] = useState({
    titulo: inicial?.titulo ?? "",
    usar_texto: inicial?.usar_texto ?? true,
    texto: inicial?.texto ?? "",
    usar_chip: inicial?.usar_chip ?? false,
    chip_id: inicial?.chip_id ?? "",
    usar_destino: inicial?.usar_destino ?? false,
    destino_id: inicial?.destino_id ?? "",
    usar_horario: inicial?.usar_horario ?? false,
    horario: inicial?.horario?.slice(0, 5) ?? "09:00",
    data_inicio: inicial?.data_inicio ?? hojeSP(),
    usar_repeticao: inicial?.usar_repeticao ?? false,
    repeticao: inicial?.repeticao ?? "unico",
    intervalo_dias: inicial?.intervalo_dias ?? 15,
    ativo: inicial?.ativo ?? true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const datasMudaram =
      !inicial ||
      inicial.data_inicio !== f.data_inicio ||
      (inicial.horario?.slice(0, 5) ?? "") !== (f.usar_horario ? f.horario : "") ||
      inicial.usar_horario !== f.usar_horario;
    salvar.mutate(
      {
        id: inicial?.id,
        titulo: f.titulo,
        usar_texto: f.usar_texto,
        texto: f.usar_texto ? f.texto : null,
        usar_chip: f.usar_chip,
        chip_id: f.usar_chip && f.chip_id ? f.chip_id : null,
        usar_destino: f.usar_destino,
        destino_id: f.usar_destino && f.destino_id ? f.destino_id : null,
        usar_horario: f.usar_horario,
        horario: f.usar_horario ? f.horario : null,
        data_inicio: f.data_inicio,
        usar_repeticao: f.usar_repeticao,
        repeticao: f.usar_repeticao ? f.repeticao : "unico",
        intervalo_dias: f.usar_repeticao && f.repeticao === "intervalo" ? Number(f.intervalo_dias) || 1 : null,
        ativo: f.ativo,
        // Reprograma do zero quando data/horário mudam
        ...(datasMudaram && inicial ? { ultimo_envio: null } : {}),
      },
      { onSuccess: () => { toast.success("Agendamento salvo"); onSalvo(); } },
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Título (para identificar)</Label>
        <Input value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Bom dia clientes" />
      </div>

      <Bloco label="Texto da mensagem" ativo={f.usar_texto} onToggle={(v) => set("usar_texto", v)}>
        <Textarea rows={4} value={f.texto} onChange={(e) => set("texto", e.target.value)} placeholder="Digite a mensagem…" />
      </Bloco>

      <Bloco label="Chip que vai enviar" ativo={f.usar_chip} onToggle={(v) => set("usar_chip", v)}>
        <Select value={f.chip_id} onValueChange={(v) => set("chip_id", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione o chip" /></SelectTrigger>
          <SelectContent>
            {chips.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} {c.numero && `· ${c.numero}`}</SelectItem>)}
          </SelectContent>
        </Select>
      </Bloco>

      <Bloco label="Destino que vai receber" ativo={f.usar_destino} onToggle={(v) => set("usar_destino", v)}>
        <Select value={f.destino_id} onValueChange={(v) => set("destino_id", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione contato ou grupo" /></SelectTrigger>
          <SelectContent>
            {destinos.map((d) => <SelectItem key={d.id} value={d.id}>{d.tipo === "grupo" ? "👥" : "👤"} {d.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </Bloco>

      <Bloco label="Horário de envio" ativo={f.usar_horario} onToggle={(v) => set("usar_horario", v)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">A partir de</Label>
            <Input type="date" value={f.data_inicio} onChange={(e) => set("data_inicio", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Hora (Brasília)</Label>
            <Input type="time" value={f.horario} onChange={(e) => set("horario", e.target.value)} />
          </div>
        </div>
      </Bloco>

      <Bloco label="Repetição" ativo={f.usar_repeticao} onToggle={(v) => set("usar_repeticao", v)}>
        <RadioGroup value={f.repeticao} onValueChange={(v) => set("repeticao", v)} className="space-y-2">
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="unico" /> Envio único</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="diario" /> Todos os dias</label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="intervalo" /> A cada
            <Input
              type="number"
              min={1}
              className="h-8 w-20"
              value={f.intervalo_dias}
              onChange={(e) => set("intervalo_dias", Number(e.target.value))}
              onFocus={() => set("repeticao", "intervalo")}
            />
            dias
          </label>
        </RadioGroup>
      </Bloco>

      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <Label htmlFor="ativo">Agendamento ativo</Label>
        <Switch id="ativo" checked={f.ativo} onCheckedChange={(v) => set("ativo", v)} />
      </div>

      <Button type="submit" className="w-full" disabled={salvar.isPending}>Salvar agendamento</Button>
    </form>
  );
}

function Bloco({ label, ativo, onToggle, children }: { label: string; ativo: boolean; onToggle: (v: boolean) => void; children: ReactNode }) {
  return (
    <div className={`rounded-lg border p-3 transition-colors ${ativo ? "border-primary/40 bg-secondary/40" : ""}`}>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <Checkbox checked={ativo} onCheckedChange={(v) => onToggle(v === true)} />
        {label}
      </label>
      {ativo && <div className="mt-3">{children}</div>}
    </div>
  );
}
