import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChecklistListItem, StatusProcesso } from "../../types/Checklist";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import { API_BASE_URL } from "../../config/api";
import ModalEncaminharMecanico from "../../components/ModalEncaminharMecanico/ModalEncaminharMecanico";
import { ListFilter, Search, X } from "lucide-react";
import { formatarPlaca, normalizarPlaca } from "../../utils/maskUtils";
import "./GerenciarChecklist.css";

type TabKey =
  | "pendentes"
  | "aguardando-aprovacao"
  | "aprovados"
  | "finalizados";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pendentes", label: "Pendentes" },
  { key: "aguardando-aprovacao", label: "Aguardando Aprovação" },
  { key: "aprovados", label: "Aprovados" },
  { key: "finalizados", label: "Concluídos" },
];

const TAB_STATUS: Record<TabKey, StatusProcesso> = {
  pendentes: "AGUARDANDO_PRECIFICACAO",
  "aguardando-aprovacao": "AGUARDANDO_APROVACAO",
  aprovados: "APROVADO",
  finalizados: "CONCLUIDO",
};

const TAB_ACAO: Record<TabKey, string> = {
  pendentes: "Precificar",
  "aguardando-aprovacao": "Visualizar",
  aprovados: "Encaminhar",
  finalizados: "Detalhes",
};

function isTabKey(value: unknown): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

function formatarDataHora(data: string) {
  const date = new Date(data);
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  const horaFormatada = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(date);
  return { dataFormatada, horaFormatada };
}

export default function GerenciarChecklist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const activeTabFromState = location.state && typeof location.state === "object"
    ? (location.state as { activeTab?: unknown }).activeTab
    : undefined;
  const [activeTab, setActiveTab] = useState<TabKey>(
    isTabKey(activeTabFromState) ? activeTabFromState : "pendentes"
  );
  const [filtroTexto, setFiltroTexto] = useState("");
  const [checklists, setChecklists] = useState<ChecklistListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEncaminharOpen, setModalEncaminharOpen] = useState(false);
  const [checklistSelecionado, setChecklistSelecionado] = useState<ChecklistListItem | null>(null);

  useEffect(() => {
    if (isTabKey(activeTabFromState)) {
      setActiveTab(activeTabFromState);
    }
  }, [activeTabFromState]);

  const buscarChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const status = TAB_STATUS[activeTab];
      const response = await fetch(`${API_BASE_URL}/checklists?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const json = await response.json();
      setChecklists(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    buscarChecklists();
  }, [buscarChecklists]);

  const dadosFiltrados = useMemo(() => {
    if (!filtroTexto.trim()) return checklists;
    const termo = filtroTexto.toLowerCase();
    const termoPlaca = normalizarPlaca(filtroTexto);
    return checklists.filter(
      (item) =>
        (termoPlaca.length > 0 && normalizarPlaca(item.placa).includes(termoPlaca)) ||
        item.nomeCliente.toLowerCase().includes(termo)
    );
  }, [checklists, filtroTexto]);

  const handleAcaoChecklist = (checklist: ChecklistListItem) => {
    if (activeTab === "aprovados") {
      setChecklistSelecionado(checklist);
      setModalEncaminharOpen(true);
      return;
    }

    if (activeTab === "aguardando-aprovacao") {
      navigate(`/checklist/${checklist.checklistId}/aprovacao-admin`, {
        state: { returnTab: activeTab },
      });
      return;
    }

    if (activeTab === "finalizados") {
      navigate(`/checklist/${checklist.checklistId}/visualizar`, {
        state: { returnTab: activeTab },
      });
      return;
    }

    navigate(`/checklist/${checklist.checklistId}/precificar`, {
      state: { returnTab: activeTab },
    });
  };

  return (
    <>
      <div className="gerenciar-checklist-container">
        <section className="checklist-header-card">
          <div className="checklist-header-copy">
            <span className="dashboard-page__eyebrow">Painel de serviços</span>
            <h1>Área do checklist</h1>
            <p>Acompanhe os serviços e avance cada checklist pela etapa correta.</p>
          </div>

          <div className="checklist-header-controls">
            <div className="checklist-control-group checklist-status-filter">
              <span className="checklist-control-label">
                <ListFilter size={15} aria-hidden="true" />
                Etapa do serviço
              </span>

              <div className="checklist-tabs" aria-label="Filtrar por status">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`checklist-tab ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                    aria-pressed={activeTab === tab.key}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="checklist-control-group checklist-search-group">
              <label className="checklist-control-label" htmlFor="checklist-search">
                <Search size={15} aria-hidden="true" />
                Pesquisar
              </label>

              <div className="checklist-search-control">
                <Search
                  size={18}
                  className="checklist-search-icon"
                  aria-hidden="true"
                />
                <input
                  id="checklist-search"
                  type="text"
                  placeholder="Placa ou nome do cliente"
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="checklist-search-input"
                />
                {filtroTexto && (
                  <button
                    type="button"
                    className="checklist-search-clear"
                    onClick={() => setFiltroTexto("")}
                    aria-label="Limpar pesquisa"
                    title="Limpar pesquisa"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <Loading />
        ) : (
          <div className="checklist-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>N° checklist</th>
                  <th>Placa</th>
                  <th>Cliente</th>
                  <th>Data de início</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.length > 0 ? (
                  dadosFiltrados.map((checklist) => (
                    <tr key={checklist.checklistId}>
                      <td>{checklist.checklistId}</td>
                      <td><span className="vehicle-plate">{formatarPlaca(checklist.placa)}</span></td>
                      <td>{checklist.nomeCliente}</td>
                      <td>
                        {formatarDataHora(checklist.criadoEm).dataFormatada +
                          " - " +
                          formatarDataHora(checklist.criadoEm).horaFormatada}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="checklist-action-button"
                          onClick={() => handleAcaoChecklist(checklist)}
                        >
                          {TAB_ACAO[activeTab]}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>Nenhum checklist encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalEncaminharOpen && checklistSelecionado && (
        <ModalEncaminharMecanico
          isOpen={modalEncaminharOpen}
          checklistId={checklistSelecionado.checklistId}
          token={token ?? ""}
          onClose={() => {
            setModalEncaminharOpen(false);
            setChecklistSelecionado(null);
          }}
          onSuccess={() => {
            buscarChecklists();
            setModalEncaminharOpen(false);
            setChecklistSelecionado(null);
          }}
        />
      )}
    </>
  );
}
