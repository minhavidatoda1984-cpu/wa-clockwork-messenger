import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Disparador WhatsApp — Painel" },
      { name: "description", content: "Painel de agendamento de mensagens de WhatsApp com múltiplos chips." },
      { property: "og:title", content: "Disparador WhatsApp — Painel" },
      { property: "og:description", content: "Painel de agendamento de mensagens de WhatsApp com múltiplos chips." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/agendamentos" });
  },
});
