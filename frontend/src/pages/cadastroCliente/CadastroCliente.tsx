import { useEffect, useState } from "react";
import "./cadastroCliente.css";
import { tCliente } from "../../types/Cliente";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import { CarFront, Plus, UserPlus } from 'lucide-react';
import Loading from "../../components/Loading/Loading";
import ModalCadastroCliente from "../../components/ModalCadastroDeCliente/ModalCadastroCliente";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { aplicarMascaraCpf, aplicarMascaraTelefone } from "../../utils/maskUtils";
import ModalCadastroVeiculo from "../../components/ModalCadastroVeiculo/ModalCadastroVeiculo";

export default function CadastroCliente() {
    const { token } = useAuth();
    const [clientes, setClientes] = useState<tCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const statusOptions = [
        { label: "Todos", value: "todos" },
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
    ];
    const [filtro, setFiltro] = useState("Todos");
    const [modalOpen, setModalOpen] = useState(false);
    const [buscarTexto, setBuscarTexto] = useState("")
    const [ModalCadastroVeiculoOpen, setModalCadastroVeiculoOpen] = useState(false);


    const bucarClientes = async () => {
        try {
            const url = new URL("http://localhost:8080/clientes");
            if (filtro.toLowerCase() !== "todos") {
                url.searchParams.append('situacao', filtro.toUpperCase());
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
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
        setLoading(true);
        bucarClientes();
    }, [filtro]);



    const clientesFiltrados = clientes.filter((cliente) => {
        const nomeMatch = cliente.nome.toLowerCase().includes(buscarTexto.toLowerCase());
        const statusMatch = filtro.toLowerCase() === "todos" || cliente.situacao.toLowerCase() === filtro.toLowerCase();
        return nomeMatch && statusMatch;
    });
    return (
        <div className="cadastro-cliente-container">
            <h1>Cadastro de Clientes</h1>
            <section className="cadastro-cliente-header">
                <SelectCustom options={statusOptions} value={filtro} onChange={setFiltro} />
                <div className="cadastro-cliente-buscar">
                    <Button text="Cadastrar cliente" icon={<UserPlus />} iconPosition="left" secondary onClick={() => setModalOpen(true)} />
                    <div className="buscar-cliente">
                        <input type="text" placeholder="Buscar por nome" value={buscarTexto} onChange={(e) => setBuscarTexto(e.target.value)} className="search-input" />

                    </div>
                </div>
            </section>

            <div className="cliente-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Veículos</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Situação</th>

                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : clientesFiltrados.length > 0 ? (
                            clientesFiltrados.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>{cliente.nome}</Link>
                                    </td>

                                    <td>
                                        <div className="td-veiculo-content">
                                            {cliente?.veiculos?.length ?? 0}
                                            <button className="add-veiculo" onClick={() => {
                                                setSelectedClienteId(cliente.id);
                                                setModalCadastroVeiculoOpen(true);
                                            }}>
                                                <CarFront size={16} />
                                                <Plus size={16} />

                                            </button>
                                        </div>
                                    </td>

                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>{aplicarMascaraCpf(cliente.cpf)}</Link>
                                    </td>

                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>{aplicarMascaraTelefone(cliente.telefone)}</Link>
                                    </td>

                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>{cliente.email}</Link>
                                    </td>

                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>
                                            {cliente.situacao.charAt(0).toUpperCase() + cliente.situacao.slice(1).toLowerCase()}
                                        </Link>
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

            {ModalCadastroVeiculoOpen && (
                <ModalCadastroVeiculo
                    isOpen={ModalCadastroVeiculoOpen}
                    clienteId={selectedClienteId}
                    onClose={() => {
                        setModalCadastroVeiculoOpen(false)
                        setSelectedClienteId(null);
                    }}
                    onSucess={() => {
                        bucarClientes();
                        setModalCadastroVeiculoOpen(false);
                    }}
                />
            )}
        </div>
    );
}
