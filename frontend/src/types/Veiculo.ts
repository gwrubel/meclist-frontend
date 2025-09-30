export type tVeiculo = {
    id: number;
    placa: string;
    modelo: string;
    marca: string;
    cor: string;
    ano: number;
    quilometragem: number;
};

export type tVeiculoCadastro = {
    placa: string;
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    quilometragem: string;
};