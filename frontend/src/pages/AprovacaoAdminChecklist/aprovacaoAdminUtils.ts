import { CategoriaParteVeiculo } from "../../types/Item";
import { EtapaFluxoManual } from "../../types/Checklist";

// Utilitários de formatação e labels vivem em src/utils/formatUtils.ts
export { formatCurrency, formatarDataHora, CHECKLIST_STATUS_LABEL } from "../../utils/formatUtils";

export const ETAPA_ORDEM: EtapaFluxoManual[] = [
  "NAO_INICIADO",
  "INICIADO",
  "PDF_GERADO",
  "CONFIRMACAO_REGISTRADA",
  "CONCLUIDO",
];

export function etapaIndex(etapa: EtapaFluxoManual): number {
  return ETAPA_ORDEM.indexOf(etapa);
}

const CATEGORIA_LABEL: Record<CategoriaParteVeiculo, string> = {
  DENTRO_DO_VEICULO: "Dentro do veículo",
  FORA_DO_VEICULO: "Fora do veículo",
  VEICULO_NO_CHAO: "Veículo no chão",
  VEICULO_NO_ELEVADOR: "Veículo no elevador",
  CAPO_LEVANTADO: "Capô levantado",
};

export function formatarCategoria(categoria: string) {
  return CATEGORIA_LABEL[categoria as CategoriaParteVeiculo] ?? categoria.replace(/_/g, " ");
}

export type LinkSeguroAprovacaoData = {
  checklistId: number;
  link: string;
  expiraEm: string;
};
