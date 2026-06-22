export interface DashboardGraficoPorMes {
  labels: string[];
  valores: number[];
}

export interface DashboardPeriodo {
  periodo: string;
  movimentados: number;
  finalizados: number;
  faturamento: number | null;
  taxaAprovacao: number | null;
  grafico: DashboardGraficoPorMes;
}

export interface DashboardEstadoAtual {
  pendentesAtuais: number;
  aguardandoAprovacao: number;
  atribuidos: number;
  emAndamento: number;
}

export interface DashboardTemposMedios {
  tempoMedioAteMecanico: number | null;
  tempoMedioExecucao: number | null;
}

export interface DashboardTopMecanico {
  id: number;
  nome: string;
  quantidadeServicos: number;
}

export interface DashboardData {
  ultimos7Dias: DashboardPeriodo;
  ultimos30Dias: DashboardPeriodo;
  estadoAtual: DashboardEstadoAtual;
  ticketMedio: number | null;
  topMecanicos: DashboardTopMecanico[];
  temposMedios: DashboardTemposMedios;
}

export interface DashboardResponse {
  data: DashboardData;
}