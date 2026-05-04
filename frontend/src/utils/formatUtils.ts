export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "--";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarDataHora(data: string): string {
  const date = new Date(data);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export const CHECKLIST_STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_PRECIFICACAO: "Aguardando Precificação",
  AGUARDANDO_APROVACAO: "Aguardando Aprovação",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  FINALIZADO: "Finalizado",
};
