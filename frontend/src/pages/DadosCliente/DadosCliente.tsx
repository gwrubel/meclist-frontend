import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {  tClienteComVeiculos } from "../../types/Cliente";
import { tVeiculo } from "../../types/Veiculo";
import Loading from "../../components/Loading/Loading";
import { ArrowLeft, Pencil, Plus, Search } from "lucide-react";
import "./DadosCliente.css";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button/Button";
import {
    aplicarMascaraCpf,
    aplicarMascaraTelefone,
    formatarPlaca,
    normalizarPlaca,
} from "../../utils/maskUtils";
import ModalCadastroVeiculo from "../../components/ModalCadastroVeiculo/ModalCadastroVeiculo";
import ModalEditarCliente from "../../components/ModalEditarCliente/ModalEditarCliente";
import ModalEditarVeiculo from "../../components/ModalEditarVeiculo/ModalEditarVeiculo";
import { buildApiUrl } from "../../config/api";


export default function DadosCliente() {
    const { id } = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<tClienteComVeiculos | null>(null);
    const [loading, setLoading] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<"Dados Do Cliente" | "Veículos">("Dados Do Cliente");
    const { token } = useAuth();
    const [buscarVeiculo, setBuscarVeiculo] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [veiculoSelecionado, setVeiculoSelecionado] = useState<tVeiculo | null>(null);
    const [modalEditarVeiculoOpen, setModalEditarVeiculoOpen] = useState(false);

    const veiculosFiltrados = (cliente?.veiculos ?? []).filter((veiculo) => {
        const termo = buscarVeiculo.trim().toLowerCase();
        if (!termo) return true;

        const termoPlaca = normalizarPlaca(buscarVeiculo);
        const placaCorresponde =
            termoPlaca.length > 0 && normalizarPlaca(veiculo.placa).includes(termoPlaca);

        return placaCorresponde || [
            veiculo.id,
            veiculo.modelo,
            veiculo.marca,
            veiculo.cor,
            veiculo.ano,
        ].some((valor) => String(valor).toLowerCase().includes(termo));
    });
    const fetchCliente = useCallback(async () => {
        try {
            const response = await fetch(buildApiUrl(`/clientes/${id}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setCliente(data.data);
        } catch (error) {
            console.error("Erro ao buscar cliente", error);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchCliente();
    }, [fetchCliente]);

    if (loading) return <Loading />;

    return (
        <div className="dados-cliente-page">
            <header className="header-cliente-card">
                <Link to="/cadastro-cliente" aria-label="Voltar para a lista de clientes" className="voltar">
                    <ArrowLeft size={26} color="var(--second-text-color)" />
                </Link>
                <div className="header-cliente-titulos">
                    <span className="dashboard-page__eyebrow">Dados do cliente</span>
                    <h2>{cliente?.nome}</h2>
                </div>
            </header>

            <div className="container-cliente-dados">
                <nav className="cliente-tabs" aria-label="Seções do cadastro de cliente">
                    <button
                        className={`cliente-tab ${abaAtiva === "Dados Do Cliente" ? "ativo" : ""}`}
                        onClick={() => setAbaAtiva("Dados Do Cliente")}
                    >
                        Dados do Cliente
                    </button>
                    <button
                        className={`cliente-tab ${abaAtiva === "Veículos" ? "ativo" : ""}`}
                        onClick={() => setAbaAtiva("Veículos")}
                    >
                        Veículos
                    </button>
                </nav>


                <section className="cliente-conteudo">
                    {abaAtiva === "Dados Do Cliente" ? (
                        <div className="dados-cliente-card">
                            <header className="dados-cliente-card__header">
                                <div>
                                    <h3>Dados do Cliente</h3>
                                    <p>Informações cadastrais e de contato.</p>
                                </div>
                                <Button
                                    text="Editar dados"
                                    type="button"
                                    icon={<Pencil size={16} />}
                                    onClick={() => setModalEditarOpen(true)}
                                />
                            </header>
                            <div className="dados-container">
                                <dl className="dados">
                                    <dt>Nome:</dt>
                                    <dd>{cliente?.nome}</dd>

                                    <dt>{cliente?.tipoDocumento}</dt>
                                    <dd>{cliente?.documento ? aplicarMascaraCpf(cliente.documento) : ""}</dd>

                                    <dt>Telefone:</dt>
                                    <dd>{cliente?.telefone ? aplicarMascaraTelefone(cliente.telefone) : ""}</dd>

                                    <dt>Email:</dt>
                                    <dd>{cliente?.email}</dd>

                                    <dt>Endereço:</dt>
                                    <dd>{cliente?.endereco}</dd>

                                    <dt>Situação:</dt>
                                    <dd>
                                        {cliente?.situacao && (
                                            <span className={`cliente-status cliente-status--${cliente.situacao.toLowerCase()}`}>
                                                {cliente.situacao.charAt(0).toUpperCase() + cliente.situacao.slice(1).toLowerCase()}
                                            </span>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>

                    ) : (
                        <div className="veiculos-cliente-card">
                            <div className="veiculos-card-header">
                                <div className="veiculos-card-heading">
                                    <div>
                                        <h3>Veículos</h3>
                                        <p>
                                            {cliente?.veiculos?.length ?? 0} {(cliente?.veiculos?.length ?? 0) === 1 ? "veículo cadastrado" : "veículos cadastrados"}
                                        </p>
                                    </div>
                                    <Button text="Adicionar Veículo" icon={<Plus size={16} />} iconPosition="right" onClick={() => setModalOpen(true)} secondary type="button" />
                                </div>

                                <div className="veiculos-toolbar">
                                    <label htmlFor="buscar-veiculo">Pesquisar veículo</label>
                                    <div className="veiculos-search-control">
                                        <Search size={18} aria-hidden="true" />
                                        <input
                                            id="buscar-veiculo"
                                            type="text"
                                            placeholder="Placa, marca, modelo, cor, ano ou ID"
                                            value={buscarVeiculo}
                                            onChange={(e) => setBuscarVeiculo(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {cliente?.veiculos && cliente.veiculos.length > 0 ? (
                                <div className="veiculos-table-wrapper">
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
                                            {veiculosFiltrados.length > 0 ? veiculosFiltrados.map((veiculo) => (
                                                <tr key={veiculo.id}>
                                                    <td>{veiculo.id}</td>
                                                    <td><span className="vehicle-plate">{formatarPlaca(veiculo.placa)}</span></td>
                                                    <td>{veiculo.modelo}</td>
                                                    <td>{veiculo.marca}</td>
                                                    <td>{veiculo.cor}</td>
                                                    <td>{veiculo.ano}</td>
                                                    <td>{new Intl.NumberFormat("pt-BR").format(veiculo.quilometragem)} km</td>
                                                    <td className="coluna-edit">
                                                        <button onClick={() => {
                                                            setVeiculoSelecionado(veiculo);
                                                            setModalEditarVeiculoOpen(true);
                                                        }} aria-label={`Editar veículo ${formatarPlaca(veiculo.placa)}`}>
                                                            <Pencil className="edit" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={8} className="veiculos-search-empty">
                                                        Nenhum veículo corresponde à pesquisa.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="veiculos-empty">Não há veículos cadastrados.</p>
                            )}
                        </div>
                    )}
                    {modalOpen && (
                        <ModalCadastroVeiculo
                            isOpen={modalOpen}
                            id={cliente?.id}
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
                            id={cliente?.id}
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
