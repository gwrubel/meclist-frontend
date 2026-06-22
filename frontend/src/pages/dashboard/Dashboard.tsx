
import { useEffect, useMemo, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Activity, BadgeDollarSign, CheckCheck, CheckSquare, Clock, Wrench } from "lucide-react";
import { buildApiUrl } from "../../config/api";
import Loading from "../../components/Loading/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/formatUtils";
import type { DashboardData } from "../../types/Dashboard";
import "./dasboard.css";

type DashboardPeriodoKey = "ultimos7Dias" | "ultimos30Dias";

const periodoOptions: Array<{ label: string; value: DashboardPeriodoKey }> = [
    { label: "7 dias", value: "ultimos7Dias" },
    { label: "30 dias", value: "ultimos30Dias" },
];

function formatPercent(value: number | null | undefined): string {
    if (value == null) return "--";
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value) + "%";
}

function clampPercent(value: number | null | undefined): number {
    if (value == null || Number.isNaN(value)) return 0;
    return Math.min(Math.max(value, 0), 100);
}

function formatMinutes(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "--";
    const total = Math.round(value);
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}min`;
}

export default function Dashboard() {
    const { token } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [periodoSelecionado, setPeriodoSelecionado] = useState<DashboardPeriodoKey>("ultimos30Dias");

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!token) {
                setError("Sessão inválida. Faça login novamente.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(buildApiUrl("/adms/dashboard"), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Erro ao carregar dashboard");
                }

                const result = await response.json();
                setDashboard(result.data);
            } catch (fetchError) {
                if (fetchError instanceof Error) {
                    setError(fetchError.message);
                    return;
                }

                setError("Erro inesperado ao carregar dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [token]);

    const periodoAtual = dashboard?.[periodoSelecionado] ?? null;
    const graficoData = useMemo(() => {
        if (!periodoAtual) return [];

        return periodoAtual.grafico.labels.map((label, index) => ({
            label,
            valor: periodoAtual.grafico.valores[index] ?? 0,
        }));
    }, [periodoAtual]);

    const taxaAprovacao = clampPercent(periodoAtual?.taxaAprovacao);
    const gaugeColor = taxaAprovacao >= 80 ? "#2E8B57" : taxaAprovacao >= 50 ? "#D86B06" : "#C0392B";
    const gaugeData = [
        { name: "aprovado", value: taxaAprovacao, color: gaugeColor },
        { name: "restante", value: Math.max(100 - taxaAprovacao, 0), color: "#E5E7EB" },
    ];
    const maiorQuantidadeServicos = Math.max(...(dashboard?.topMecanicos.map((mecanico) => mecanico.quantidadeServicos) ?? [0]), 0);

    if (loading) {
        return (
            <section className="dashboard-page">
                <header className="dashboard-page__header">
                    <div>
                        <h1>Dashboard Administrativo</h1>
                        <p>Visão consolidada de desempenho e movimentação da oficina.</p>
                    </div>
                </header>
                <div className="dashboard-page__state">
                    <Loading />
                </div>
            </section>
        );
    }

    if (error || !dashboard || !periodoAtual) {
        return (
            <section className="dashboard-page">
                <header className="dashboard-page__header">
                    <div>
                        <h1>Dashboard Administrativo</h1>
                        <p>Visão consolidada de desempenho e movimentação da oficina.</p>
                    </div>
                </header>
                <div className="dashboard-page__state dashboard-page__state--error">
                    <p>{error ?? "Nenhum dado disponível para a dashboard."}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard-page">
            <header className="dashboard-page__header">
                <div>
                    <span className="dashboard-page__eyebrow">Painel administrativo</span>
                    <h1>Dashboard Administrativo</h1>
                    <p>Painel de gestão com visão histórica do período e status operacional atual.</p>
                </div>
            </header>

             <section className="dashboard-section dashboard-section--current" aria-label="Estado atual da oficina">
                <div className="dashboard-section__titles">
                    <span className="dashboard-section__eyebrow">Estado atual da oficina</span>
                    <h2>Como está a operação agora</h2>
                    <p>Métricas operacionais em tempo real, independentes do filtro de período.</p>
                </div>

                <section className="dashboard-current-grid">
                    <article className="dashboard-card dashboard-card--metric">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><CheckSquare size={20} /></div>
                            <span className="dashboard-card__label">Checklists ativos</span>
                        </div>
                        <strong className="dashboard-card__value">{dashboard.estadoAtual.pendentesAtuais}</strong>
                        <p className="dashboard-card__hint">Checklists que ainda não foram concluídos</p>
                    </article>

                      <article className="dashboard-card dashboard-card--metric">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><CheckCheck size={20} /></div>
                            <span className="dashboard-card__label">Aguardando aprovação</span>
                        </div>
                        <strong className="dashboard-card__value">{dashboard.estadoAtual.aguardandoAprovacao}</strong>
                        <p className="dashboard-card__hint">OS aguardando retorno do cliente</p>
                    </article>
                    
                      <article className="dashboard-card dashboard-card--metric">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><Wrench size={20} /></div>
                            <span className="dashboard-card__label">Atribuídos</span>
                        </div>
                        <strong className="dashboard-card__value">{dashboard.estadoAtual.atribuidos}</strong>
                        <p className="dashboard-card__hint">Serviços atribuidos e não iniciados</p>
                    </article>

                    <article className="dashboard-card dashboard-card--metric">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><Activity size={20} /></div>
                            <span className="dashboard-card__label">Em andamento</span>
                        </div>
                        <strong className="dashboard-card__value">{dashboard.estadoAtual.emAndamento}</strong>
                        <p className="dashboard-card__hint">Serviços em andamento</p>
                    </article>

                  

                  
                </section>
            </section>

            <section className="dashboard-section dashboard-section--activity" aria-label="Atividade do período">
                <div className="dashboard-section__top">
                    <div className="dashboard-section__titles">
                        <span className="dashboard-section__eyebrow">Atividade do período</span>
                        <h2>O que aconteceu no período</h2>
                        <p>Todas as métricas abaixo refletem o período selecionado.</p>
                    </div>

                    <div className="dashboard-period-toggle" aria-label="Selecionar período">
                        {periodoOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={option.value === periodoSelecionado ? "dashboard-period-toggle__button active" : "dashboard-period-toggle__button"}
                                onClick={() => setPeriodoSelecionado(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <section className="dashboard-activity-grid">
                    <article className="dashboard-card dashboard-card--metric dashboard-card--kpi">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><Wrench size={20} /></div>
                            <span className="dashboard-card__label">Movimentados</span>
                        </div>
                        <strong className="dashboard-card__value">{periodoAtual.movimentados}</strong>
                        <p className="dashboard-card__hint">Checklists movimentados no período</p>
                    </article>

                    <article className="dashboard-card dashboard-card--metric dashboard-card--kpi">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><CheckCheck size={20} /></div>
                            <span className="dashboard-card__label">Finalizados</span>
                        </div>
                        <strong className="dashboard-card__value">{periodoAtual.finalizados}</strong>
                        <p className="dashboard-card__hint">OS concluídas dentro do período</p>
                    </article>

                    <article className="dashboard-card dashboard-card--metric dashboard-card--kpi">
                        <div className="dashboard-card__header">
                            <div className="dashboard-card__icon"><BadgeDollarSign size={20} /></div>
                            <span className="dashboard-card__label">Faturamento</span>
                        </div>
                        <strong className="dashboard-card__value">{formatCurrency(periodoAtual.faturamento)}</strong>
                        <p className="dashboard-card__hint">Receita bruta gerada por serviços concluídos</p>
                    </article>
                </section>

                <section className="dashboard-main-grid">
                    <article className="dashboard-card dashboard-card--chart">
                        <div className="dashboard-card__topline">
                            <div>
                                <span className="dashboard-card__label">Volume de checklists movimentados ao longo do período</span>
                                <h2>Movimentação de checklists</h2>
                            </div>
                            <span className="dashboard-card__badge">{periodoAtual.periodo}</span>
                        </div>

                        {graficoData.length > 0 ? (
                            <div className="dashboard-chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={graficoData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D86B06" stopOpacity={0.28} />
                                                <stop offset="95%" stopColor="#D86B06" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                                        <Tooltip
                                            formatter={(value) => [`${value ?? 0} Checklists`, "Total"]}
                                            labelFormatter={(label) => `Período: ${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="valor"
                                            stroke="#D86B06"
                                            strokeWidth={3}
                                            fill="url(#dashboardArea)"
                                            dot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="dashboard-empty-state">
                                <Activity size={20} />
                                <p>Sem dados no período.</p>
                            </div>
                        )}
                    </article>

                    <div className="dashboard-side-grid">
                        <article className="dashboard-card dashboard-card--gauge dashboard-card--kpi">
                            <div className="dashboard-card__topline">
                                <div>
                                    <span className="dashboard-card__label">Taxa de aprovação</span>
                                    <h2>{periodoAtual.periodo}</h2>
                                </div>
                            </div>

                            <div className="dashboard-gauge-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gaugeData}
                                            dataKey="value"
                                            innerRadius={60}
                                            outerRadius={82}
                                            startAngle={90}
                                            endAngle={-270}
                                            cornerRadius={8}
                                            paddingAngle={taxaAprovacao > 0 && taxaAprovacao < 100 ? 2 : 0}
                                        >
                                            {gaugeData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="dashboard-gauge-center">
                                    <strong>{formatPercent(periodoAtual.taxaAprovacao)}</strong>
                                    <span>Percentual de orçamentos aprovados no período</span>
                                </div>
                            </div>
                        </article>

                        <article className="dashboard-card dashboard-card--ticket">
                            <div className="dashboard-card__topline">
                                <div>
                                    <span className="dashboard-card__label">Ticket médio</span>
                                    <h2>Últimos 30 dias</h2>
                                </div>
                            </div>

                            <div className="dashboard-ticket-content">
                                <strong>{formatCurrency(dashboard.ticketMedio)}</strong>
                                <p>Indicador complementar de valor médio por ordem concluída.</p>
                            </div>
                        </article>
                    </div>
                </section>

                <article className="dashboard-card dashboard-card--ranking">
                    <div className="dashboard-card__topline">
                        <div>
                            <span className="dashboard-card__label">Top 3 mecânicos</span>
                            <h2>Ranking por serviços no período</h2>
                        </div>
                    </div>

                    {dashboard.topMecanicos.length > 0 ? (
                        <div className="dashboard-ranking-list">
                            {dashboard.topMecanicos.map((mecanico, index) => {
                                const width = maiorQuantidadeServicos > 0
                                    ? `${(mecanico.quantidadeServicos / maiorQuantidadeServicos) * 100}%`
                                    : "0%";

                                return (
                                    <div key={mecanico.id} className="dashboard-ranking-item">
                                        <div className="dashboard-ranking-item__header">
                                            <span className="dashboard-ranking-item__position">{index + 1}º</span>
                                            <strong>{mecanico.nome}</strong>
                                            <span>{mecanico.quantidadeServicos} serviços</span>
                                        </div>
                                        <div className="dashboard-ranking-item__track">
                                            <div className="dashboard-ranking-item__bar" style={{ width }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dashboard-empty-state">
                            <Wrench size={20} />
                            <p>Nenhum serviço registrado no período.</p>
                        </div>
                    )}
                </article>

                    <article className="dashboard-card dashboard-card--tempos">
                        <div className="dashboard-card__topline">
                            <div>
                                <span className="dashboard-card__label">Tempos médios</span>
                                <h2>Eficiência operacional</h2>
                            </div>
                        </div>

                        <div className="dashboard-tempos-grid">
                            <div className="dashboard-tempos-item">
                                <div className="dashboard-card__header">
                                    <div className="dashboard-card__icon"><Clock size={20} /></div>
                                    <span className="dashboard-card__label">Até atribuição</span>
                                </div>
                                <strong className="dashboard-card__value">{formatMinutes(dashboard.temposMedios.tempoMedioAteMecanico)}</strong>
                                <p className="dashboard-card__hint">Tempo médio entre abertura do checklist e atribuição a um mecânico</p>
                            </div>

                            <div className="dashboard-tempos-item">
                                <div className="dashboard-card__header">
                                    <div className="dashboard-card__icon"><Clock size={20} /></div>
                                    <span className="dashboard-card__label">Execução</span>
                                </div>
                                <strong className="dashboard-card__value">{formatMinutes(dashboard.temposMedios.tempoMedioExecucao)}</strong>
                                <p className="dashboard-card__hint">Tempo médio entre atribuição ao mecânico e conclusão do serviço</p>
                            </div>
                        </div>
                    </article>
            </section>

           
        </section>
    );
}