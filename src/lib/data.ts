import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Chip = T["chips"]["Row"];
export type Destino = T["destinos"]["Row"];
export type Agendamento = T["agendamentos"]["Row"];
export type AgendamentoInsert = T["agendamentos"]["Insert"];
export type Envio = T["envios"]["Row"];
export type EnvioComAgendamento = Envio & {
  agendamentos: Pick<Agendamento, "titulo" | "texto" | "chip_id" | "destino_id"> | null;
};

export const useChips = () =>
  useQuery({
    queryKey: ["chips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chips").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useDestinos = () =>
  useQuery({
    queryKey: ["destinos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("destinos").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

export const useAgendamentos = () =>
  useQuery({
    queryKey: ["agendamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useEnvios = () =>
  useQuery({
    queryKey: ["envios"],
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("envios")
        .select("*, agendamentos(titulo, texto, chip_id, destino_id)")
        .order("enviado_em", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data as unknown as EnvioComAgendamento[];
    },
  });

/** Traduz a resposta crua da Evolution/n8n para uma frase curta. */
export function resumirResposta(e: Pick<Envio, "sucesso" | "resposta">): string {
  const r = e.resposta ?? "";
  if (e.sucesso) return "Aceito pela Evolution e enviado ao WhatsApp.";
  if (!r) return "Falhou, sem detalhes.";
  const codigo = r.match(/(?:status code |"message":"|\b)(40[0-9]|50[0-9])\b/)?.[1];
  if (codigo === "401") return "Chave (apikey) da Evolution recusada (401).";
  if (codigo === "404") return "Instância ou rota não encontrada na Evolution (404).";
  if (codigo === "400") return "Evolution recusou os dados enviados (400): confira número/grupo.";
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT/.test(r)) return "Não foi possível conectar ao servidor da Evolution.";
  return r.replace(/\\+"/g, '"').slice(0, 160);
}

type TableName = "chips" | "destinos" | "agendamentos";

export function useSalvar<N extends TableName>(tabela: N) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: T[N]["Insert"] & { id?: string }) => {
      const { id, ...rest } = row;
      const q = id
        ? supabase.from(tabela).update(rest as never).eq("id" as never, id as never)
        : supabase.from(tabela).insert(rest as never);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [tabela] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInserirVarios<N extends TableName>(tabela: N) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: T[N]["Insert"][]) => {
      const { error } = await supabase.from(tabela).insert(rows as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [tabela] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useExcluir(tabela: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tabela).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [tabela] });
      toast.success("Excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function descreverRepeticao(a: Pick<Agendamento, "usar_repeticao" | "repeticao" | "intervalo_dias">) {
  if (!a.usar_repeticao || a.repeticao === "unico") return "Envio único";
  if (a.repeticao === "diario") return "Todos os dias";
  return `A cada ${a.intervalo_dias ?? 1} dia(s)`;
}

export function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}
