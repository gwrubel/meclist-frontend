type situacao = "ATIVO" | "INATIVO";
//mecanico que vem do banco de dados
export type tMecanico = {
    id : number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    situacao: situacao;
};


export type tMecanicoCadastro = {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    senha: string;
}

export type tServicoConcluidoMecanico = {
    checklistId: number;
    nomeCliente: string;
    placa: string;
    modelo: string;
    dataInicio: string;
    dataConclusao: string;
};

