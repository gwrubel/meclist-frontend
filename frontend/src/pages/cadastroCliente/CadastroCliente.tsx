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
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { buildApiUrl } from "../../config/api";

export default function CadastroCliente() {
    const { token } = useAuth();
    const [clientes, setClientes] = useState<tCliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClienteId, setSelectedClienteId] = useState<number | undefined>(undefined);
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
            const url = new URL(buildApiUrl("/clientes"));
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
            const data = await response.json();
            setClientes(data.data);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro:", error.message);
                setError(error.message);
                showErrorToast(error.message);
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
            <section className="cadastro-cliente-header-card">
                <div className="cadastro-cliente-title">
                    <span className="dashboard-page__eyebrow">Gerenciar clientes</span>
                    <h1>Cadastro de Clientes</h1>
                </div>

                <section className="cadastro-cliente-header">
                    <div className="cadastro-cliente-filter">
                        <SelectCustom options={statusOptions} value={filtro} onChange={setFiltro} />
                    </div>
                    <div className="cadastro-cliente-buscar">
                        <Button text="Cadastrar cliente" icon={<UserPlus />} iconPosition="left" secondary onClick={() => setModalOpen(true)} />
                        <input
                            type="text"
                            placeholder="Buscar por nome"
                            value={buscarTexto}
                            onChange={(e) => setBuscarTexto(e.target.value)}
                            className="search-input cadastro-cliente-search"
                        />
                    </div>
                </section>
            </section>

            <div className="cliente-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Veículos</th>
                            <th>CPF/CNPJ</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Situação</th>

                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
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
                                            {cliente?.quantidadeVeiculos}
                                            <button className="add-veiculo" onClick={() => {
                                                setSelectedClienteId(cliente.id);
                                                setModalCadastroVeiculoOpen(true);
                                            }} aria-label={`Adicionar veículo para ${cliente.nome}`}>
                                                <CarFront size={16} />
                                                <Plus size={16} />

                                            </button>
                                        </div>
                                    </td>

                                    <td>
                                        <Link to={`/cliente/${cliente.id}`}>{aplicarMascaraCpf(cliente.documento)}</Link>
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
                        showSuccessToast("Cliente cadastrado com sucesso.");
                    }}
                />
            )}

            {ModalCadastroVeiculoOpen && (
                <ModalCadastroVeiculo
                    isOpen={ModalCadastroVeiculoOpen}
                    id={selectedClienteId}
                    onClose={() => {
                        setModalCadastroVeiculoOpen(false)
                        setSelectedClienteId(undefined);
                    }}
                    onSucess={() => {
                        bucarClientes();
                        setModalCadastroVeiculoOpen(false);
                        setSelectedClienteId(undefined);
                    }}
                />
            )}
        </div>
    );
}
