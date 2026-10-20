import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, User, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDestinos, useExcluir, useInserirVarios } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/destinos")({
  head: () => ({
    meta: [
      { title: "Destinos — Disparador WhatsApp" },
      { name: "description", content: "Contatos e grupos de WhatsApp que recebem mensagens." },
      { property: "og:title", content: "Destinos — Disparador WhatsApp" },
      { property: "og:description", content: "Contatos e grupos de WhatsApp que recebem mensagens." },
    ],
  }),
  component: DestinosPage,
});

function DestinosPage() {
  const { data: destinos = [] } = useDestinos();
  const inserir = useInserirVarios("destinos");
  const excluir = useExcluir("destinos");
  const [tipo, setTipo] = useState<"contato" | "grupo">("contato");
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "contato" | "grupo">("todos");

  function adicionar() {
    const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
    const rows = [];
    for (const l of linhas) {
      const [nome, id] = l.split(/[;,\t]/).map((s) => s?.trim());
      if (!nome || !id) return toast.error(`Linha inválida: "${l}"`);
      rows.push({ tipo, nome, identificador: tipo === "contato" ? id.replace(/\D/g, "") : id });
    }
    if (!rows.length) return;
    inserir.mutate(rows, {
      onSuccess: () => { setTexto(""); toast.success(`${rows.length} destino(s) adicionados`); },
    });
  }

  const lista = destinos.filter((d) => filtro === "todos" || d.tipo === filtro);

  return (
    <>
      <PageHeader titulo="Destinos" descricao="Contatos individuais e grupos que recebem as mensagens." />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Adicionar destinos</h2>
          <Tabs value={tipo} onValueChange={(v) => setTipo(v as "contato" | "grupo")}>
            <TabsList className="w-full">
              <TabsTrigger value="contato" className="flex-1"><User className="h-4 w-4" /> Contato</TabsTrigger>
              <TabsTrigger value="grupo" className="flex-1"><Users className="h-4 w-4" /> Grupo</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-1.5">
            <Label>Um por linha: {tipo === "contato" ? "nome; número" : "nome; ID do grupo"}</Label>
            <Textarea
              rows={8}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={tipo === "contato" ? "Maria; 5511988887777\nJoão; 5521977776666" : "Clientes VIP; 120363012345678901@g.us"}
              className="font-mono text-sm"
            />
          </div>
          <Button className="w-full" onClick={adicionar} disabled={inserir.isPending}>Adicionar</Button>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-sm text-muted-foreground">{lista.length} destino(s)</span>
            <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="contato">Contatos</TabsTrigger>
                <TabsTrigger value="grupo">Grupos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Número / ID</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.nome}</TableCell>
                  <TableCell><Badge variant={d.tipo === "grupo" ? "warning" : "secondary"}>{d.tipo}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{d.identificador}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => confirm(`Excluir ${d.nome}?`) && excluir.mutate(d.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Nenhum destino.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
