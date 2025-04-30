import { useEffect, useState } from "react";
import "./CadastroMecanico.css";
import { tMecanico } from "../../types/Mecanico";
import InputCustom from "../../components/InputCustom/InputCustom";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import {  Pencil, UserPlus } from 'lucide-react';
import { Link } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ModalCadastroMecanico from "../../components/CadastroDeMecanico/ModalCadastroMecanico";
import ModalEditarMecanico from "../../components/EditarMecanico/ModalEditarMecanico";
export default function CadastroMecanico() {
    const [mecanicos, setMecanicos] = useState<tMecanico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState("Todos");
    const [buscarTexto, setBuscarTexto] = useState(""); // <- novo state para busca
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
            const url = new URL("http://localhost:8080/mecanicos");
            if (filtro.toLowerCase() !== "todos") {
                url.searchParams.append('situacao', filtro.toUpperCase());
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error("Erro ao buscar mecânicos");
            }
            const data: tMecanico[] = await response.json();
            setMecanicos(data);
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
            <h1>Cadastro de Mecânicos</h1>
            <section className="cadastro-mecanico-header">
                <SelectCustom options={statusOptions} value={filtro} onChange={setFiltro} />
                <div className="cadastro-mecanico-buscar">
                    <Button text="Cadastrar mecânico" icon={<UserPlus />} iconPosition="left" secondary onClick={() => setModalCadastroOpen(true)} />
                    <div className="buscar-mecanico">
                        <InputCustom
                            name="buscar"
                            value={buscarTexto}
                            onChange={(e) => setBuscarTexto(e.target.value)}
                            type="text"
                            placeholder="Buscar mecânico"
                        />

                    </div>
                </div>
            </section>

            <div className="mecanico-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Celular</th>
                            <th>E-mail</th>
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
                                    <td><Link to={`/mecanicos/${mecanico.id}`}>MEC-{String(mecanico.id).padStart(3, '0')}</Link></td>
                                    <td><Link to={`/mecanicos/${mecanico.id}`}>{mecanico.nome}</Link></td>
                                    <td>{mecanico.telefone}</td>
                                    <td>{mecanico.email}</td>
                                    <td>{mecanico.situacao.charAt(0).toUpperCase() + mecanico.situacao.slice(1).toLowerCase()}</td>
                                    <td className="coluna-edit">
                                        <button onClick={() => {
                                            setMecanicoSelecionado(mecanico);
                                            setModalEditarOpen(true);
                                        }}>
                                            <Pencil className="edit" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                              <td colSpan={6}>{error}</td>
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
