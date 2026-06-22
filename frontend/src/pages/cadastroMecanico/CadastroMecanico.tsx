import { useEffect, useState } from "react";
import "./CadastroMecanico.css";
import { tMecanico } from "../../types/Mecanico";

import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import { Pencil, Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { Link } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ModalCadastroMecanico from "../../components/ModalCadastroDeMecanico/ModalCadastroMecanico";
import ModalEditarMecanico from "../../components/ModalEditarMecanico/ModalEditarMecanico";
import { useAuth } from "../../contexts/AuthContext";
import { aplicarMascaraTelefone } from "../../utils/maskUtils";
import { buildApiUrl } from "../../config/api";



export default function CadastroMecanico() {
    const { token } = useAuth();
    const [mecanicos, setMecanicos] = useState<tMecanico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState("Todos");
    const [buscarTexto, setBuscarTexto] = useState(""); 
    const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [mecanicoSelecionado, setMecanicoSelecionado] = useState<tMecanico | null>(null);

    const statusOptions = [
        { label: "Todos", value: "todos" },
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
    ];

    const bucarMecanicos = async () => {
        try {
            const url = new URL(buildApiUrl("/mecanicos"));
            if (filtro.toLowerCase() !== "todos") {
                url.searchParams.append('situacao', filtro.toUpperCase());
            }

            const response = await fetch(url.toString(),{
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error("Erro ao buscar mecânicos");
            }
            const data = await response.json();
            setMecanicos(data.data);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro:", error.message);
                setError(error.message);
                
            }
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setLoading(true);
        bucarMecanicos();

    }, [filtro]);

    const mecanicosFiltrados = mecanicos.filter((mecanico) => {
        const nomeMatch = mecanico.nome.toLowerCase().includes(buscarTexto.toLowerCase());
        const statusMatch = filtro.toLowerCase() === "todos" || mecanico.situacao.toLowerCase() === filtro.toLowerCase();
        return nomeMatch && statusMatch;
    });

  

    return (
        <div className="cadastro-mecanico-container">
            <section className="cadastro-mecanico-header-card">
                <div className="cadastro-mecanico-title-row">
                    <div className="cadastro-mecanico-title">
                        <span className="dashboard-page__eyebrow">Gerenciar mecânicos</span>
                        <h1>Cadastro de Mecânicos</h1>
                        <p>Gerencie a equipe responsável pelos serviços da oficina.</p>
                    </div>

                    <div className="cadastro-mecanico-header-action">
                        <Button text="Cadastrar mecânico" icon={<UserPlus />} iconPosition="left" secondary onClick={() => setModalCadastroOpen(true)} />
                    </div>
                </div>

                <section className="cadastro-mecanico-header">
                    <div className="cadastro-mecanico-control-group">
                        <span className="cadastro-mecanico-control-label">
                            <SlidersHorizontal size={15} aria-hidden="true" />
                            Filtros
                        </span>
                        <div className="cadastro-mecanico-filter">
                            <SelectCustom
                                label="Situação"
                                ariaLabel="Filtrar mecânicos por situação"
                                options={statusOptions}
                                value={filtro}
                                onChange={setFiltro}
                            />
                        </div>
                    </div>

                    <div className="cadastro-mecanico-control-group cadastro-mecanico-search-group">
                        <label className="cadastro-mecanico-control-label" htmlFor="cadastro-mecanico-search">
                            <Search size={15} aria-hidden="true" />
                            Pesquisar
                        </label>
                        <div className="cadastro-mecanico-search-control">
                            <Search size={18} className="cadastro-mecanico-search-icon" aria-hidden="true" />
                            <input
                                id="cadastro-mecanico-search"
                                type="text"
                                placeholder="Buscar mecânico por nome"
                                value={buscarTexto}
                                onChange={(e) => setBuscarTexto(e.target.value)}
                                className="cadastro-mecanico-search"
                            />
                        </div>
                    </div>
                </section>

            </section>

            <div className="mecanico-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th className="hide-on-mobile">Celular</th>
                            <th className="hide-on-mobile">E-mail</th>
                            <th>Situação</th>
                            <th>Editar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <Loading /> 
                                </td>
                            </tr>
                        ) : mecanicosFiltrados.length > 0 ? (
                            mecanicosFiltrados.map((mecanico) => (
                                <tr  key={mecanico.id}>
                                    <td>
                                        <Link to={`/mecanicos/${mecanico.id}`} state={{ mecanicoNome: mecanico.nome }}>
                                            MEC-{String(mecanico.id).padStart(3, '0')}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link to={`/mecanicos/${mecanico.id}`} state={{ mecanicoNome: mecanico.nome }}>
                                            {mecanico.nome}
                                        </Link>
                                    </td>
                                    <td className="hide-on-mobile">{aplicarMascaraTelefone(mecanico.telefone)}</td>
                                    <td className="hide-on-mobile">{mecanico.email}</td>
                                    <td>
                                        <span className={`mecanico-table-status mecanico-table-status--${mecanico.situacao.toLowerCase()}`}>
                                            {mecanico.situacao.charAt(0).toUpperCase() + mecanico.situacao.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="coluna-edit">
                                        <button onClick={() => {
                                            setMecanicoSelecionado(mecanico);
                                            setModalEditarOpen(true);
                                        }} aria-label={`Editar mecânico ${mecanico.nome}`}>
                                            <Pencil className="edit" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                              <td colSpan={6}>{error ? error : "Nenhum mecânico encontrado."}</td>
                            </tr>
                        )}
                    </tbody>


                </table>
            </div>

            {modalCadastroOpen && (
                <ModalCadastroMecanico
                    isOpen={modalCadastroOpen}
                    onClose={() => setModalCadastroOpen(false)}
                    onSucess={() => {
                        bucarMecanicos();
                        setModalCadastroOpen(false);
                       
                    }}
                />
            )}
            {modalEditarOpen && mecanicoSelecionado && (
                <ModalEditarMecanico
                    isOpen={modalEditarOpen}
                    onClose={() => {
                        setModalEditarOpen(false);
                        setMecanicoSelecionado(null);
                    }}
                    mecanico={mecanicoSelecionado}
                    onSucess={() => {
                        bucarMecanicos();
                        setModalEditarOpen(false);
                        setMecanicoSelecionado(null);
                        
                    }}
                />
            )}
        </div>
    );
}
