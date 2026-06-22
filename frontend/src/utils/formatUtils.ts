import { CategoriaParteVeiculo } from "../types/Item";

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
  CONCLUIDO: "Concluído",
  FINALIZADO: "Finalizado",
};

export const CATEGORIA_LABEL: Record<CategoriaParteVeiculo, string> = {
  DENTRO_DO_VEICULO: "Dentro do veículo",
  FORA_DO_VEICULO: "Fora do veículo",
  VEICULO_NO_CHAO: "Veículo no chão",
  VEICULO_NO_ELEVADOR: "Veículo no elevador",
  CAPO_LEVANTADO: "Capô levantado",
};

export function formatarCategoria(categoria: string): string {
  return CATEGORIA_LABEL[categoria as CategoriaParteVeiculo] ?? categoria.replace(/_/g, " ");
}
