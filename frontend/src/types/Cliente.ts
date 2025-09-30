import { tVeiculo } from "./Veiculo";

type situacao = "ATIVO" | "INATIVO";
//cliente que vem do banco de dados
export type tCliente = {
    id: number;
    nome: string;
    veiculos: tVeiculo[];
    cpf: string;
    telefone: string;
    email: string;
    situacao: situacao;
    endereco: string;
};



export type tClienteCadastro = {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    senha: string;
}

