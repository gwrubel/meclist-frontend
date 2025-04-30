type situacao = "ATIVO" | "INATIVO";
//cliente que vem do banco de dados
export type tCliente = {
    id: number;
    nome: string;
    veiculos: [];
    cpf: string;
    telefone: string;
    email: string;
    situacao: situacao;
};


export type tClienteCadastro = {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    senha: string;
}