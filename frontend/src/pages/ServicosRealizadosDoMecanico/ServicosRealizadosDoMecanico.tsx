import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { tServicoConcluidoMecanico } from "../../types/Mecanico";
import Loading from "../../components/Loading/Loading";
import { SelectCustom } from "../../components/Select/SelectCustom";
import { useAuth } from "../../contexts/AuthContext";
import { buildApiUrl } from "../../config/api";
import "./ServicosRealizadosDoMecanico.css";

export default function ServicosRealizadosDoMecanico() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [servicos, setServicos] = useState<tServicoConcluidoMecanico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [buscarTexto, setBuscarTexto] = useState("");
    const [filtro, setFiltro] = useState("todos");

    const nomeMecanicoState =
        location.state && typeof location.state === "object"
            ? (location.state as { mecanicoNome?: string }).mecanicoNome
            : undefined;

    const periodoOptions = [
        { label: "Todos", value: "todos" },
        { label: "Hoje", value: "hoje" },
        { label: "Últimos 7 dias", value: "7dias" },
        { label: "Últimos 30 dias", value: "30dias" },
    ];

    useEffect(() => {
        const fetchServicosConcluidos = async () => {
            if (!id) {
                setError("Mecânico não informado.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(buildApiUrl(`/mecanicos/${id}/servicos/concluidos`), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Mecânico não encontrado.");
                    }
                    throw new Error("Erro ao buscar serviços concluídos do mecânico.");
                }

                const data = await response.json();
                const lista = Array.isArray(data?.data) ? data.data : [];
                setServicos(lista);
            } catch (err) {
                if (err instanceof Error) setError(err.message);
                else setError("Erro desconhecido");
            } finally {
                setLoading(false);
            }
        };

        fetchServicosConcluidos();
    }, [id, token]);

    const servicosFiltrados = useMemo(() => {
        const texto = buscarTexto.trim().toLowerCase();

        const filtraPorPeriodo = (dataConclusao: string) => {
            if (filtro === "todos") return true;

            const concluidoEm = new Date(dataConclusao);
            if (Number.isNaN(concluidoEm.getTime())) return false;

            const agora = new Date();
            const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

            if (filtro === "hoje") {
                return concluidoEm >= inicioHoje;
            }

            const diffMs = agora.getTime() - concluidoEm.getTime();
            const diffDias = diffMs / (1000 * 60 * 60 * 24);

            if (filtro === "7dias") return diffDias <= 7;
            if (filtro === "30dias") return diffDias <= 30;

            return true;
        };

        return servicos.filter((servico) => {
            const matchBusca =
                texto.length === 0 ||
                servico.nomeCliente.toLowerCase().includes(texto) ||
                servico.placa.toLowerCase().includes(texto) ||
                servico.modelo.toLowerCase().includes(texto) ||
                String(servico.checklistId).includes(texto);

            return matchBusca && filtraPorPeriodo(servico.dataConclusao);
        });
    }, [servicos, buscarTexto, filtro]);

    const formatarDataSegura = (valor: string) => {
        if (!valor) return "--";
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return "--";

        const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(data);

        const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(data);

        return `${dataFormatada} as ${horaFormatada}`;
    };

    const mecanicoLabel = nomeMecanicoState || (id ? `MEC-${String(id).padStart(3, "0")}` : "Mecânico");

    return (
        <div className="servicos-mecanico-container">
            <button
                type="button"
                className="servicos-mecanico-back-button"
                onClick={() => navigate("/cadastro-mecanico")}
                aria-label="Voltar para cadastro de mecânicos"
                title="Voltar"
            >
                <ArrowLeft size={18} />
            </button>

            <section className="servicos-mecanico-header-card">
                <div className="servicos-mecanico-title">
                    <span className="dashboard-page__eyebrow">Mecânico: {mecanicoLabel}</span>
                    <h1>Serviços concluídos</h1>
                </div>

                <section className="servicos-mecanico-header">
                    <div className="servicos-mecanico-filter">
                        <SelectCustom options={periodoOptions} value={filtro} onChange={setFiltro} />
                    </div>
                    <div className="servicos-mecanico-buscar">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, placa, modelo ou checklist"
                            value={buscarTexto}
                            onChange={(e) => setBuscarTexto(e.target.value)}
                            className="search-input servicos-mecanico-search"
                        />
                    </div>
                </section>
            </section>

            <div className="servicos-table">
                <table>
                    <thead>
                        <tr>
                            <th>Checklist</th>
                            <th>Cliente</th>
                            <th>Placa</th>
                            <th className="hide-on-mobile">Modelo</th>
                            <th className="hide-on-mobile">Início</th>
                            <th>Conclusão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : servicosFiltrados.length > 0 ? (
                            servicosFiltrados.map((servico) => (
                                <tr key={servico.checklistId}>
                                    <td>
                                        <Link
                                            to={`/checklist/${servico.checklistId}/visualizar`}
                                            state={{ backTo: `/mecanicos/${id}` }}
                                        >
                                            {servico.checklistId}
                                        </Link>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/checklist/${servico.checklistId}/visualizar`}
                                            state={{ backTo: `/mecanicos/${id}` }}
                                        >
                                            {servico.nomeCliente}
                                        </Link>
                                    </td>
                                    <td>{servico.placa || "--"}</td>
                                    <td className="hide-on-mobile">{servico.modelo || "--"}</td>
                                    <td className="hide-on-mobile">{formatarDataSegura(servico.dataInicio)}</td>
                                    <td>{formatarDataSegura(servico.dataConclusao)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6}>{error || "Nenhum serviço concluído encontrado."}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
