export type tParteVeiculo = {
     id: number;
  nome: string;
  imagem: string;
  categoriaParteVeiculo: CategoriaParteVeiculo;
}

export type CategoriaParteVeiculo =
  | "DENTRO_DO_VEICULO"
  | "FORA_DO_VEICULO"
  | "VEICULO_NO_CHAO"
  | "VEICULO_NO_ELEVADOR"
  | "CAPO_LEVANTADO";