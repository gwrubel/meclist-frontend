import { tVeiculo } from "./Veiculo";


type situacao = "ATIVO" | "INATIVO";
type tipoDocumento = "CPF" | "CNPJ";
//cliente que vem do banco de dados
export type tCliente = {
    id: number;
    nome: string;
    quantidadeVeiculos: number;
    documento: string;
    tipoDocumento: tipoDocumento;
    telefone: string;
    email: string;
    situacao: situacao;
    endereco: string;
};

export type tClienteComVeiculos = tCliente & {
    veiculos: tVeiculo[];
};



export type tClienteCadastro = {
    nome: string;
    tipoDocumento: tipoDocumento;
    documento: string;
    telefone: string;
    email: string;
    endereco: string;
    senha: string;
}

