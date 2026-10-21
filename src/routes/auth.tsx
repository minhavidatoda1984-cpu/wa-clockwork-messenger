import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Disparador WhatsApp" },
      { name: "description", content: "Acesse o painel de agendamento de mensagens de WhatsApp." },
      { property: "og:title", content: "Entrar — Disparador WhatsApp" },
      { property: "og:description", content: "Acesse o painel de agendamento de mensagens de WhatsApp." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) {
        toast.error("E-mail ou senha inválidos");
        return;
      }
      navigate({ to: "/agendamentos" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin },
      });
      setCarregando(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      setModo("entrar");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-5 rounded-2xl bg-card p-8 shadow-xl">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold">Disparador</h1>
            <p className="text-sm text-muted-foreground">
              {modo === "entrar" ? "Entre no seu painel" : "Crie seu acesso"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={carregando}>
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </Button>
        <button
          type="button"
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {modo === "entrar" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
