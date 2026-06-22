import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ChecklistCompletoResponse,
  StatusProcesso,
  ItemVisualizacao,
  ItemCompletoBackend,
} from "../../types/Checklist";
import { CategoriaParteVeiculo } from "../../types/Item";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import ItemVisualizacaoCard from "../../components/ItemVisualizacaoCard/ItemVisualizacaoCard";
import {
  formatCurrency,
  formatarCategoria,
  formatarDataHora,
  CHECKLIST_STATUS_LABEL,
} from "../../utils/formatUtils";
import { formatarPlaca } from "../../utils/maskUtils";
import { buildApiUrl } from "../../config/api";
import { toast } from "react-toastify";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Layers3,
} from "lucide-react";
import "./VisualizarChecklistCompleto.css";

const STATUS_LABEL = CHECKLIST_STATUS_LABEL as Record<StatusProcesso, string>;

const ORDEM_CATEGORIAS: CategoriaParteVeiculo[] = [
  "DENTRO_DO_VEICULO",
  "FORA_DO_VEICULO",
  "VEICULO_NO_CHAO",
  "VEICULO_NO_ELEVADOR",
  "CAPO_LEVANTADO",
];

function processarItem(itemBackend: ItemCompletoBackend): ItemVisualizacao {
  return {
    id: itemBackend.itemChecklistId,
    descricao: itemBackend.nomeDoItem,
    statusItem: itemBackend.statusItem,
    maoDeObraValor: itemBackend.maoDeObra,
    produtos: itemBackend.produtos.map((produto) => ({
      descricao: produto.nomeProduto,
      quantidade: produto.quantidade,
      precoUnitario: produto.preco,
      marca: produto.marca,
      aprovadoCliente: produto.aprovadoCliente,
    })),
    fotos: itemBackend.fotos.map((foto) => foto.url),
  };
}

function processarGrupos(dados: ChecklistCompletoResponse) {
  return ORDEM_CATEGORIAS.map((categoria) => ({
    categoria,
    label: formatarCategoria(categoria),
    itens: (dados.itensPorCategoria?.[categoria] ?? []).map(processarItem),
  })).filter((grupo) => grupo.itens.length > 0);
}

export default function VisualizarChecklistCompleto() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo =
    location.state && typeof location.state === "object"
      ? (location.state as { backTo?: string }).backTo
      : undefined;
  const returnTab =
    location.state && typeof location.state === "object"
      ? (location.state as { returnTab?: string }).returnTab ?? "pendentes"
      : "pendentes";

  const [dados, setDados] = useState<ChecklistCompletoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const voltarParaLista = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate("/gerenciar-checklist", { state: { activeTab: returnTab } });
  };

  const buscarChecklistCompleto = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await fetch(buildApiUrl(`/checklists/${checklistId}/completo`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setErro("Você não tem permissão para visualizar este checklist.");
        } else if (response.status === 404) {
          setErro("Checklist não encontrado.");
        } else {
          setErro("Erro ao carregar checklist.");
        }
        return;
      }

      const json = await response.json();
      setDados(json.data);
    } catch (error) {
      console.error("Erro ao buscar checklist completo:", error);
      setErro("Erro ao conectar com o servidor.");
      toast.error("Erro ao carregar checklist.");
    } finally {
      setLoading(false);
    }
  }, [checklistId, token]);

  useEffect(() => {
    buscarChecklistCompleto();
  }, [buscarChecklistCompleto]);

  if (loading) return <Loading />;

  if (erro || !dados) {
    return (
      <div className="visualizar-checklist-erro">
        <AlertCircle size={48} />
        <h2>{erro || "Checklist não encontrado"}</h2>
        <button type="button" onClick={voltarParaLista} className="btn-voltar-erro">
          Voltar
        </button>
      </div>
    );
  }

  const grupos = processarGrupos(dados);
  const totalItens = grupos.reduce((total, grupo) => total + grupo.itens.length, 0);
  const dataConclusao = dados.dataConclusao ?? dados.DataConclusao ?? dados.atualizadoEm;
  const quilometragem = Number.isFinite(dados.quilometragem)
    ? `${new Intl.NumberFormat("pt-BR").format(dados.quilometragem)} km`
    : "--";

  return (
    <div className="visualizar-checklist-container">
      <section className="visualizar-checklist-header-card">
        <span className="dashboard-page__eyebrow">Consulta completa</span>
        <ChecklistPageHeader
          title={`Checklist #${dados.checklistId}`}
          metaItems={[
            { label: "Placa", value: <span className="vehicle-plate">{formatarPlaca(dados.placa)}</span> },
            {
              label: "Veículo",
              value: (
                <span className="visualizar-checklist-vehicle-summary">
                  <span>{dados.marca} {dados.modelo}</span>
                  <small>{dados.ano} • {dados.cor || "--"} • {quilometragem}</small>
                </span>
              ),
            },
            { label: "Cliente", value: dados.nomeCliente },
            { label: "Mecânico", value: dados.nomeMecanico || "Não atribuído" },
            {
              label: "Período",
              value: (
                <span className="visualizar-checklist-period">
                  <span className="visualizar-checklist-period-step">
                    <CalendarClock size={16} aria-hidden="true" />
                    <span>
                      <small>Iniciado</small>
                      <b>{formatarDataHora(dados.criadoEm)}</b>
                    </span>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                  <span className="visualizar-checklist-period-step visualizar-checklist-period-step--finished">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>
                      <small>Finalizado</small>
                      <b>{formatarDataHora(dataConclusao)}</b>
                    </span>
                  </span>
                </span>
              ),
            },
            { label: "Valor total", value: formatCurrency(dados.valorTotal) },
          ]}
          status={dados.status}
          statusLabel={STATUS_LABEL[dados.status] ?? dados.status}
          onVoltar={voltarParaLista}
        />
      </section>

      <div className="visualizar-checklist-conteudo">
        <div className="visualizar-checklist-itens">
          <header className="visualizar-checklist-secao-header">
            <span className="visualizar-checklist-secao-icon" aria-hidden="true">
              <ClipboardCheck size={22} />
            </span>
            <div>
              <span className="dashboard-page__eyebrow">Inspeção detalhada</span>
              <h2>Itens do serviço</h2>
              <p>{totalItens} {totalItens === 1 ? "item registrado" : "itens registrados"} em {grupos.length} {grupos.length === 1 ? "parte do veículo" : "partes do veículo"}.</p>
            </div>
          </header>

          {grupos.length === 0 ? (
            <p className="visualizar-checklist-vazio">Nenhum item registrado neste checklist.</p>
          ) : (
            <div className="visualizar-checklist-categorias">
              {grupos.map((grupo, index) => (
                <section className="visualizar-checklist-categoria" key={grupo.categoria}>
                  <header className="visualizar-checklist-categoria-header">
                    <span className="visualizar-checklist-categoria-indice">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="visualizar-checklist-categoria-icon" aria-hidden="true">
                      <Layers3 size={19} />
                    </span>
                    <div>
                      <h3>{grupo.label}</h3>
                      <p>{grupo.itens.length} {grupo.itens.length === 1 ? "item inspecionado" : "itens inspecionados"}</p>
                    </div>
                  </header>

                  <div className="visualizar-checklist-categoria-itens">
                    {grupo.itens.map((item) => (
                      <ItemVisualizacaoCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
