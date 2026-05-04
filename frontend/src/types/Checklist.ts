import { CategoriaParteVeiculo } from "./Item";

export type StatusItem = "PENDENTE" | "OK" | "TROCAR" | "VERIFICAR";

export type StatusProcesso =
  | "AGUARDANDO_PRECIFICACAO"
  | "AGUARDANDO_APROVACAO"
  | "APROVADO"
  | "FINALIZADO";

export type FotoChecklist = {
  id: number;
  url: string;
  criadoEm: string;
};

export type ProdutoChecklist = {
  checklistProdutoId: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number | null;
  marca: string | null;
};

export type ItemChecklistDetalhe = {
  itemChecklistId: number;
  itemId: number;
  nomeDoItem: string;
  parteDoVeiculo: CategoriaParteVeiculo;
  statusItem: StatusItem;
  fotos: FotoChecklist[];
  produtos: ProdutoChecklist[];
  maoDeObra: number | null;
};

export type ChecklistDetalheResponse = {
  checklistId: number;
  veiculoId: number;
  placa: string;
  nomeCliente: string;
  status: StatusProcesso;
  criadoEm: string;
  atualizadoEm: string;
  itensPorCategoria: Partial<Record<CategoriaParteVeiculo, ItemChecklistDetalhe[]>>;
};

export type ChecklistListItem = {
  checklistId: number;
  veiculoId: number;
  placa: string;
  nomeCliente: string;
  status: StatusProcesso;
  etapaFluxoManual?: EtapaFluxoManual;
  criadoEm: string;
  atualizadoEm: string;
};

export type ProdutoPrecificado = {
  checklistProdutoId: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  marca: string;
  valorUnitario: number;
};

export type EtapaFluxoManual =
  | "NAO_INICIADO"
  | "INICIADO"
  | "PDF_GERADO"
  | "CONFIRMACAO_REGISTRADA"
  | "CONCLUIDO";

export type CanalConfirmacao =
  | "WHATSAPP"
  | "EMAIL"
  | "TELEFONE"
  | "PRESENCIAL"
  | "OUTRO";

export type ProdutoAprovacaoAdmin = {
  checklistProdutoId: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  marca: string | null;
  aprovadoCliente: boolean | null;
};

export type ItemAprovacaoAdmin = {
  itemChecklistId: number;
  nomeDoItem: string;
  parteDoVeiculo: CategoriaParteVeiculo;
  statusItem: StatusItem;
  maoDeObra: number | null;
  fotos: FotoChecklist[];
  produtos: ProdutoAprovacaoAdmin[];
};

export type ChecklistAprovacaoAdminResponse = {
  checklistId: number;
  veiculoId: number;
  placa: string;
  modelo: string;
  marca: string;
  status: StatusProcesso;
  valorTotal: number;
  etapaFluxoManual?: EtapaFluxoManual;
  criadoEm: string;
  atualizadoEm: string;
  itensPorCategoria: Partial<Record<CategoriaParteVeiculo, ItemAprovacaoAdmin[]>>;
};