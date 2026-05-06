import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistListItem, StatusProcesso } from "../../types/Checklist";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import { API_BASE_URL } from "../../config/api";
import ModalEncaminharMecanico from "../../components/ModalEncaminharMecanico/ModalEncaminharMecanico";
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
  { key: "finalizados", label: "Finalizados" },
];

const TAB_STATUS: Record<TabKey, StatusProcesso> = {
  pendentes: "AGUARDANDO_PRECIFICACAO",
  "aguardando-aprovacao": "AGUARDANDO_APROVACAO",
  aprovados: "APROVADO",
  finalizados: "FINALIZADO",
};

const TAB_ACAO: Record<TabKey, string> = {
  pendentes: "Precificar",
  "aguardando-aprovacao": "Visualizar",
  aprovados: "Encaminhar",
  finalizados: "Detalhes",
};

function formatarDataHora(data: string) {
  const date = new Date(data);
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  const horaFormatada = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(date);
  return { dataFormatada, horaFormatada };
}

export default function GerenciarChecklist() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("pendentes");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [checklists, setChecklists] = useState<ChecklistListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEncaminharOpen, setModalEncaminharOpen] = useState(false);
  const [checklistSelecionado, setChecklistSelecionado] = useState<ChecklistListItem | null>(null);

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
    return checklists.filter(
      (item) =>
        item.placa.toLowerCase().includes(termo) ||
        item.nomeCliente.toLowerCase().includes(termo)
    );
  }, [checklists, filtroTexto]);

  return (
    <>
      <div className="gerenciar-checklist-container">
        <div className="checklist-header-card">
          <div>
            <span className="dashboard-page__eyebrow">Painel de serviços</span>
            <h1>Área do checklist</h1>
          </div>

          <div className="checklist-tabs" aria-label="Filtrar por status">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`checklist-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="checklist-toolbar">
          <input
            type="text"
            placeholder="Filtrar por placa ou cliente"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            className="checklist-search-input"
          />
        </div>

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
                      <td>{checklist.placa}</td>
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
                          onClick={() => {
                            if (activeTab === "aprovados") {
                              setChecklistSelecionado(checklist);
                              setModalEncaminharOpen(true);
                            } else if (activeTab === "aguardando-aprovacao") {
                              navigate(`/checklist/${checklist.checklistId}/aprovacao-admin`);
                            } else {
                              navigate(`/checklist/${checklist.checklistId}/precificar`);
                            }
                          }}
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
