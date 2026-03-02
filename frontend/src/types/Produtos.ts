export type tProduto = {
    id: number;
    produtoId: number;  
    nomeProduto: string;
    situacao: "ATIVO" | "INATIVO";
};

export type tProdutoCadastro = {
    nomeProduto: string;
};