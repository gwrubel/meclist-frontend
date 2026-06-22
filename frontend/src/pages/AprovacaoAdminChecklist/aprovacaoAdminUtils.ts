import { EtapaFluxoManual } from "../../types/Checklist";

// Utilitários de formatação e labels vivem em src/utils/formatUtils.ts
export { formatCurrency, formatarDataHora, CHECKLIST_STATUS_LABEL, formatarCategoria } from "../../utils/formatUtils";

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

export type LinkSeguroAprovacaoData = {
  checklistId: number;
  link: string;
  expiraEm: string;
};
