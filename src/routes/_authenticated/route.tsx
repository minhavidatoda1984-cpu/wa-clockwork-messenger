import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { CalendarClock, ListChecks, Smartphone, Users, Workflow, LogOut, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const links = [
  { to: "/agendamentos", label: "Agendamentos", icon: CalendarClock },
  { to: "/envios", label: "Envios", icon: ListChecks },
  { to: "/chips", label: "Chips", icon: Smartphone },
  { to: "/destinos", label: "Destinos", icon: Users },
  { to: "/n8n", label: "Integração n8n", icon: Workflow },
] as const;

function Layout() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-sidebar text-sidebar-foreground md:w-60">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold">Disparador</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent md:mt-auto"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
