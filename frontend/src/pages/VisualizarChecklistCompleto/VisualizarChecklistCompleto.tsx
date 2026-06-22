import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChecklistCompletoResponse, StatusProcesso, ItemVisualizacao } from "../../types/Checklist";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import ItemVisualizacaoCard from "../../components/ItemVisualizacaoCard/ItemVisualizacaoCard";
import { formatCurrency, CHECKLIST_STATUS_LABEL } from "../../utils/formatUtils";
import { buildApiUrl } from "../../config/api";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import "./VisualizarChecklistCompleto.css";

const STATUS_LABEL = CHECKLIST_STATUS_LABEL as Record<StatusProcesso, string>;

// Função para processar itens do backend e converter para formato do componente
function processarItens(dados: ChecklistCompletoResponse): ItemVisualizacao[] {
  const itensArray: ItemVisualizacao[] = [];
  
  // Verificar se itensPorCategoria existe
  if (!dados.itensPorCategoria) {
    return itensArray;
  }
  
  // Iterar por todas as categorias e seus itens
  Object.values(dados.itensPorCategoria).forEach((itensCategoria) => {
    if (itensCategoria) {
      itensCategoria.forEach((itemBackend) => {
        itensArray.push({
          id: itemBackend.itemChecklistId,
          descricao: itemBackend.nomeDoItem,
          statusItem: itemBackend.statusItem,
          maoDeObraValor: itemBackend.maoDeObra,
          produtos: itemBackend.produtos.map((p) => ({
            descricao: p.nomeProduto,
            quantidade: p.quantidade,
            precoUnitario: p.preco,
            marca: p.marca,
            aprovadoCliente: p.aprovadoCliente,
          })),
          fotos: itemBackend.fotos.map((f) => f.url),
        });
      });
    }
  });
  
  return itensArray;
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

  // Processar itens do backend
  const itens = processarItens(dados);

  return (
    <div className="visualizar-checklist-container">
      <ChecklistPageHeader
        title={`Checklist #${dados.checklistId}`}
        metaItems={[
          { label: "Placa", value: dados.placa },
          { label: "Veículo", value: `${dados.marca} ${dados.modelo} (${dados.ano})` },
          { label: "Cliente", value: dados.nomeCliente },
          { label: "Valor Total", value: formatCurrency(dados.valorTotal) },
          {
            label: "Mecânico",
            value: dados.nomeMecanico || "Não atribuído",
          },
        ]}
        status={dados.status}
        statusLabel={STATUS_LABEL[dados.status] ?? dados.status}
        onVoltar={voltarParaLista}
      />

      <div className="visualizar-checklist-conteudo">
        {/* Itens do Serviço */}
        <div className="visualizar-checklist-itens">
          <h2 className="visualizar-checklist-secao-titulo">Itens do Serviço</h2>
          {itens.length === 0 ? (
            <p className="visualizar-checklist-vazio">Nenhum item registrado neste checklist.</p>
          ) : (
            itens.map((item) => <ItemVisualizacaoCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
