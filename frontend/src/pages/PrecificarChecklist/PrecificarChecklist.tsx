import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChecklistDetalheResponse, ItemChecklistDetalhe, ProdutoPrecificado, StatusProcesso } from "../../types/Checklist";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import Button from "../../components/Button/Button";
import ItemPrecificacaoCard from "../../components/ItemPrecificacaoCard/ItemPrecificacaoCard";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import { formatCurrency, CHECKLIST_STATUS_LABEL, formatarCategoria } from "../../utils/formatUtils";
import { CategoriaParteVeiculo } from "../../types/Item";
import "./PrecificarChecklist.css";
import { toast } from "react-toastify";
import { API_BASE_URL, buildApiUrl } from "../../config/api";

const STATUS_LABEL = CHECKLIST_STATUS_LABEL as Record<StatusProcesso, string>;

function processarItensPrecificaveis(checklist: ChecklistDetalheResponse): ItemChecklistDetalhe[] {
  const itensArray: ItemChecklistDetalhe[] = [];

  if (!checklist.itensPorCategoria) {
    return itensArray;
  }

  Object.values(checklist.itensPorCategoria).forEach((itensCategoria) => {
    if (itensCategoria) {
      itensCategoria.forEach((itemBackend) => {
        itensArray.push({
          ...itemBackend,
          produtos: itemBackend.produtos ?? [],
          fotos: itemBackend.fotos ?? [],
        });
      });
    }
  });

  return itensArray;
}

export default function PrecificarChecklist() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab =
    location.state && typeof location.state === "object"
      ? (location.state as { returnTab?: string }).returnTab ?? "pendentes"
      : "pendentes";

  const [checklist, setChecklist] = useState<ChecklistDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [precificacao, setPrecificacao] = useState<
    Record<number, { produtos: ProdutoPrecificado[]; maoDeObra: number }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const buscarChecklist = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await fetch(buildApiUrl(`/checklists/${checklistId}/precificacao`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          setErro("Você não tem permissão para precificar este checklist.");
        } else if (response.status === 404) {
          setErro("Checklist não encontrado.");
        } else {
          setErro("Erro ao carregar checklist para precificação.");
        }
        return;
      }

      const json = await response.json();
      console.log("Checklist de precificação carregado:", json);
      setChecklist(json.data);
    } catch (error) {
      console.error("Erro ao buscar checklist de precificação:", error);
      setErro("Erro ao conectar com o servidor.");
      toast.error("Erro ao carregar checklist.");
    } finally {
      setLoading(false);
    }
  }, [checklistId, token]);

 

  useEffect(() => {
    buscarChecklist();
  }, [buscarChecklist]);

  const handlePrecificacaoChange = useCallback((
    itemChecklistId: number,
    produtos: ProdutoPrecificado[],
    maoDeObra: number
  ) => {
    setPrecificacao((prev) => ({
      ...prev,
      [itemChecklistId]: { produtos, maoDeObra },
    }));
  }, []);

  const valorTotal = Object.values(precificacao).reduce((total, item) => {
    const totalProdutos = item.produtos.reduce(
      (s, p) => s + p.valorUnitario * p.quantidade,
      0
    );
    return total + totalProdutos + item.maoDeObra;
  }, 0);

  const voltarParaLista = () => {
    navigate("/gerenciar-checklist", { state: { activeTab: returnTab } });
  };



const handleEnviarParaAprovacao = async () => {
  if (!checklist || submitting) return;

  const itens = processarItensPrecificaveis(checklist);

  // Validação e montagem do payload em uma única iteração
  const itensPrecificados = [];

  for (const item of itens) {
    const prec = precificacao[item.itemChecklistId];

    if (!prec) {
      toast.error(`Item "${item.nomeDoItem}" não foi preenchido.`);
      return;
    }

    if (!prec.produtos || prec.produtos.length === 0) {
      toast.error(`O item "${item.nomeDoItem}" precisa ter pelo menos um produto anexado.`);
      return;
    }

    if (!prec.maoDeObra || prec.maoDeObra <= 0) {
      toast.error(`Informe a mão de obra do item "${item.nomeDoItem}".`);
      return;
    }

    for (const produto of prec.produtos) {
      if (!produto.valorUnitario || produto.valorUnitario <= 0) {
        toast.error(`Informe o valor do produto no item "${item.nomeDoItem}".`);
        return;
      }

      if (!produto.marca || produto.marca.trim() === "") {
        toast.error(`Informe a marca do produto no item "${item.nomeDoItem}".`);
        return;
      }
    }

    itensPrecificados.push({
      itemChecklistId: item.itemChecklistId,
      maoDeObra: prec.maoDeObra,
      produtos: prec.produtos.map((p) => {
        const isNovo = p.checklistProdutoId < 0;
        return isNovo
          ? {
              checklistProdutoId: null,
              produtoId: p.produtoId,
              quantidade: p.quantidade,
              valorUnitario: p.valorUnitario,
              marca: p.marca,
            }
          : {
              checklistProdutoId: p.checklistProdutoId,
              valorUnitario: p.valorUnitario,
              marca: p.marca,
            };
      }),
    });
  }

  setSubmitting(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/checklists/${checklistId}/precificar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itens: itensPrecificados }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message ?? "Erro ao enviar precificação.");
    }

    toast.success("Precificação enviada com sucesso!");
    voltarParaLista();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar precificação.";
    toast.error(message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <Loading />;
  if (erro || !checklist) return <p>{erro || "Checklist não encontrado."}</p>;

  const categorias = Object.entries(checklist.itensPorCategoria || {}) as [CategoriaParteVeiculo, ItemChecklistDetalhe[]][];
  const temItens = categorias.some(([, itensCategoria]) => itensCategoria && itensCategoria.length > 0);

  return (
    <div className="precificar-checklist-container">
      <ChecklistPageHeader
        title={`Precificação — Checklist #${checklist.checklistId}`}
        metaItems={[
          { label: "Placa", value: checklist.placa },
          { label: "Cliente", value: checklist.nomeCliente },
          { label: "Valor total", value: formatCurrency(valorTotal) },
        ]}
        status={checklist.status}
        statusLabel={STATUS_LABEL[checklist.status] ?? checklist.status}
        onVoltar={voltarParaLista}
      />
      {/* Itens agrupados por categoria */}
      <div className="precificar-itens">
        {!temItens ? (
          <p className="precificar-vazio">Nenhum item com produto para precificar.</p>
        ) : (
          categorias.map(([categoria, itensCategoria]) => {
            if (!itensCategoria || itensCategoria.length === 0) return null;
            
            return (
              <div key={categoria} className="precificar-categoria">
                <h2 className="precificar-categoria-titulo">
                  {formatarCategoria(categoria)}
                </h2>
                <div className="precificar-categoria-itens">
                  {itensCategoria.map((item) => (
                    <ItemPrecificacaoCard
                      key={item.itemChecklistId}
                      item={item}
                      token={token!}
                      onChange={(produtos, maoDeObra) =>
                        handlePrecificacaoChange(item.itemChecklistId, produtos, maoDeObra)
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="precificar-footer">
        <span className="precificar-total">
          Valor total estimado:{" "}
          <strong>{formatCurrency(valorTotal)}</strong>
        </span>
        <div className="precificar-acoes">
          <Button text="Cancelar" onClick={voltarParaLista} />
          <Button
            text={submitting ? "Enviando..." : "Enviar para aprovação"}
            secondary
            icon={<Send size={16} />}
            iconPosition="right"
            disabled={submitting}
            onClick={handleEnviarParaAprovacao}
          />
        </div>
      </div>
    </div>
  );
}
