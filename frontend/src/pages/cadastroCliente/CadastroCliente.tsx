import { useEffect, useState } from "react";
import "./cadastroCliente.css";
import { tCliente } from "../../types/Cliente";
import InputCustom from "../../components/InputCustom/InputCustom";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import { Pencil, UserPlus } from 'lucide-react';
import Loading from "../../components/Loading/Loading";
import ModalCadastroCliente from "../../components/CadastroDeCliente/ModalCadastroCliente";

export default function CadastroCliente() {
    const [clientes, setClientes] = useState<tCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const statusOptions = [
        { label: "Todos", value: "todos" },
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
    ];
    const [filtro, setFiltro] = useState("Todos");
    const [modalOpen, setModalOpen] = useState(false);

    const bucarClientes = async () => {
        try {
            const response = await fetch("http://localhost:8080/clientes");
            if (!response.ok) {
                throw new Error("Erro ao buscar clientes");
            }
            const data: tCliente[] = await response.json();
            setClientes(data);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro:", error.message);
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        bucarClientes();
    }, []);

    return (
        <div className="cadastro-mecanico-container">
            <h1>Cadastro de Clientes</h1>
            <section className="cadastro-mecanico-header">
                <SelectCustom options={statusOptions} value={filtro} onChange={setFiltro} />
                <div className="cadastro-mecanico-buscar">
                    <Button text="Cadastrar cliente" icon={<UserPlus />} iconPosition="left" secondary onClick={() => setModalOpen(true)} />
                    <div className="buscar-mecanico">
                        <InputCustom name="buscar" value="" onChange={() => { }} type="text" placeholder="Buscar cliente" />
                        <Button text="Buscar" />
                    </div>
                </div>
            </section>

            <div className="mecanico-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Veículos</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Situação</th>
                            <th>Editar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : clientes.length > 0 ? (
                            clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.veiculos}</td>
                                    <td>{cliente.cpf}</td>
                                    <td>{cliente.telefone}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.situacao.charAt(0).toUpperCase() + cliente.situacao.slice(1).toLowerCase()}</td>
                                    <td className="coluna-edit">
                                        <button>
                                            <Pencil className="edit" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7}>{error ? error : "Nenhum cliente encontrado."}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <ModalCadastroCliente
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false) }}
                    onSucess={() => {
                        bucarClientes();
                        setModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
