import type { ReactNode } from "react";

export function PageHeader({ titulo, descricao, children }: { titulo: string; descricao?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
