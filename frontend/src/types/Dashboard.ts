export interface DashboardGraficoPorMes {
  labels: string[];
  valores: number[];
}

export interface DashboardPeriodo {
  periodo: string;
  totalServicos: number;
  servicosPendentes: number;
  servicosFinalizados: number;
  valorTotalMovimentado: number | null;
  graficoOsPorMes: DashboardGraficoPorMes;
}

export interface DashboardTopMecanico {
  id: number;
  nome: string;
  quantidadeServicos: number;
}

export interface DashboardData {
  ultimos7Dias: DashboardPeriodo;
  ultimos30Dias: DashboardPeriodo;
  ticketMedio: number | null;
  taxaAprovacao: number | null;
  topMecanicos: DashboardTopMecanico[];
}

export interface DashboardResponse {
  data: DashboardData;
}