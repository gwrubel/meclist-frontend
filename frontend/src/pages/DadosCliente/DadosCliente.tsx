import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { tCliente } from "../../types/Cliente";
import { tVeiculo } from "../../types/Veiculo";
import Loading from "../../components/Loading/Loading";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import "./DadosCliente.css";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import { aplicarMascaraCpf, aplicarMascaraTelefone } from "../../utils/maskUtils";
import ModalCadastroVeiculo from "../../components/ModalCadastroVeiculo/ModalCadastroVeiculo";
import ModalEditarCliente from "../../components/ModalEditarCliente/ModalEditarCliente";
import ModalEditarVeiculo from "../../components/ModalEditarVeiculo/ModalEditarVeiculo";


export default function DadosCliente() {
    const { id } = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<tCliente | null>(null);
    const [loading, setLoading] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<"Dados Do Cliente" | "Veículos">("Dados Do Cliente");
    const { token } = useAuth();
    const [filtro, setFiltro] = useState("Todos");
    const statusOptions = [
        { label: "Todos", value: "todos" }
    ]
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [veiculoSelecionado, setVeiculoSelecionado] = useState<tVeiculo | null>(null);
    const [modalEditarVeiculoOpen, setModalEditarVeiculoOpen] = useState(false);
    async function fetchCliente() {
        try {
            const response = await fetch(`http://localhost:8080/clientes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setCliente(data);
        } catch (error) {
            console.error("Erro ao buscar cliente", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {


        fetchCliente();
    }, [id]);

    if (loading) return <Loading />;

    return (

        <div >
            <header className="header-cliente">
                <Link to="/cadastro-cliente" aria-label="Voltar para a lista de clientes" className="voltar">
                    <ArrowLeft size={32} color="var(--text-color)" />
                </Link>
                <h2>{cliente?.nome}</h2>
            </header>

            <div className="container-cliente-dados">
                <nav className="cliente-nav">
                    <button
                        className={abaAtiva === "Dados Do Cliente" ? "ativo" : ""}
                        onClick={() => setAbaAtiva("Dados Do Cliente")}
                    >
                        Dados do Cliente
                    </button>
                    <button
                        className={abaAtiva === "Veículos" ? "ativo" : ""}
                        onClick={() => setAbaAtiva("Veículos")}
                    >
                        Veículos
                    </button>
                </nav>


                <section className="cliente-conteudo">
                    {abaAtiva === "Dados Do Cliente" ? (
                        <div className="dados-cliente">
                            <header>
                                <h3>Dados do Cliente</h3>
                            </header>
                            <div className="dados-container">
                                <dl className="dados">
                                    <dt>Nome:</dt>
                                    <dd>{cliente?.nome}</dd>

                                    <dt>CPF:</dt>
                                    <dd>{cliente?.cpf ? aplicarMascaraCpf(cliente.cpf) : ""}</dd>

                                    <dt>Telefone:</dt>
                                    <dd>{cliente?.telefone ? aplicarMascaraTelefone(cliente.telefone) : ""}</dd>

                                    <dt>Email:</dt>
                                    <dd>{cliente?.email}</dd>

                                    <dt>Endereço:</dt>
                                    <dd>{cliente?.endereco}</dd>

                                    <dt>Situação:</dt>
                                    <dd>
                                        {cliente?.situacao
                                            ? cliente.situacao.charAt(0).toUpperCase() + cliente.situacao.slice(1).toLowerCase()
                                            : ""}
                                    </dd>
                                </dl>
                                <div className="botao-editar">
                                    <Button text="Editar" type="button" onClick={() => setModalEditarOpen(true)} />
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div className="veiculos-cliente">
                            <h3>Veículos</h3>
                            <div className="veiculos-header">

                                <SelectCustom options={statusOptions} value={filtro} onChange={setFiltro} />

                                <Button text="Adicionar Veículo" icon={<Plus size={16} />} iconPosition="right" onClick={() => setModalOpen(true)} secondary type="button" />
                            </div>
                            {cliente?.veiculos && cliente.veiculos.length > 0 ? (
                                <table className="cliente-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Placa</th>
                                            <th>Modelo</th>
                                            <th>Marca</th>
                                            <th>Cor</th>
                                            <th>Ano</th>
                                            <th>Quilometragem</th>
                                            <th>Editar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cliente.veiculos.map((veiculo) => (
                                            <tr key={veiculo.id}>
                                                <td>{veiculo.id}</td>
                                                <td>{veiculo.placa}</td>
                                                <td>{veiculo.modelo}</td>
                                                <td>{veiculo.marca}</td>
                                                <td>{veiculo.cor}</td>
                                                <td>{veiculo.ano}</td>
                                                <td>{veiculo.quilometragem}</td>
                                                <td className="coluna-edit">
                                                    <button onClick={() => {
                                                        setVeiculoSelecionado(veiculo);
                                                        setModalEditarVeiculoOpen(true);
                                                    }} aria-label={`Editar veículo ${veiculo.placa}`}>
                                                        <Pencil className="edit" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Não há veículos cadastrados.</p>
                            )}
                        </div>
                    )}
                    {modalOpen && (
                        <ModalCadastroVeiculo
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            onSucess={() => {
                                fetchCliente();
                                setModalOpen(false);
                            }}
                        />
                    )}

                    {modalEditarOpen && (
                        <ModalEditarCliente
                            isOpen={modalEditarOpen}
                            cliente={cliente}
                            onClose={() => setModalEditarOpen(false)}
                            onSucess={() => {
                                fetchCliente();
                                setModalEditarOpen(false);
                            }}
                        />
                    )}

                    {modalEditarVeiculoOpen && (
                        <ModalEditarVeiculo
                            cliente={cliente}
                            isOpen={modalEditarVeiculoOpen}
                            veiculo={veiculoSelecionado}
                            onClose={() => setModalEditarVeiculoOpen(false)}
                            onSucess={() => {
                                fetchCliente();
                                setModalEditarVeiculoOpen(false);
                            }}
                        />
                    )}

                </section>
            </div>
        </div>
    );
}
