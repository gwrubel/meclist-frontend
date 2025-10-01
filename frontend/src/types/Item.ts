export type tItem = {
     id: number;
  nome: string;
  imagemIlustrativa: string;
  parteDoVeiculo: CategoriaParteVeiculo;
}

export type CategoriaParteVeiculo =
  | "DENTRO_DO_VEICULO"
  | "FORA_DO_VEICULO"
  | "VEICULO_NO_CHAO"
  | "VEICULO_NO_ELEVADOR"
  | "CAPO_LEVANTADO";

