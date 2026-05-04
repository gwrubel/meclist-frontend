import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ChecklistDetalheResponse, ItemChecklistDetalhe, ProdutoPrecificado, StatusProcesso } from "../../types/Checklist";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import Button from "../../components/Button/Button";
import ItemPrecificacaoCard from "../../components/ItemPrecificacaoCard/ItemPrecificacaoCard";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import { formatCurrency, CHECKLIST_STATUS_LABEL } from "../../utils/formatUtils";
import "./PrecificarChecklist.css";
import { toast } from "react-toastify";
import { API_BASE_URL, buildApiUrl } from "../../config/api";

const STATUS_LABEL = CHECKLIST_STATUS_LABEL as Record<StatusProcesso, string>;

function itensPrecificaveis(checklist: ChecklistDetalheResponse): ItemChecklistDetalhe[] {
  return Object.values(checklist.itensPorCategoria).flat();
}

export default function PrecificarChecklist() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState<ChecklistDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [precificacao, setPrecificacao] = useState<
    Record<number, { produtos: ProdutoPrecificado[]; maoDeObra: number }>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const buscarChecklist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/checklists/${checklistId}/precificacao`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      console.log(json.data);
      setChecklist(json.data);
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



const handleEnviarParaAprovacao = async () => {
  if (!checklist || submitting) return;

  const itens = itensPrecificaveis(checklist);

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

  console.log(itensPrecificados);

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
    navigate(-1);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar precificação.";
    toast.error(message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <Loading />;
  if (!checklist) return <p>Checklist não encontrado.</p>;

  const itens = itensPrecificaveis(checklist);

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
        onVoltar={() => navigate(-1)}
      />
      {/* Itens */}
      <div className="precificar-itens">
        {itens.length === 0 ? (
          <p className="precificar-vazio">Nenhum item com produto para precificar.</p>
        ) : (
          itens.map((item) => (
            <ItemPrecificacaoCard
              key={item.itemChecklistId}
              item={item}
              token={token!}
              onChange={(produtos, maoDeObra) =>
                handlePrecificacaoChange(item.itemChecklistId, produtos, maoDeObra)
              }
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="precificar-footer">
        <span className="precificar-total">
          Valor total estimado:{" "}
          <strong>{formatCurrency(valorTotal)}</strong>
        </span>
        <div className="precificar-acoes">
          <Button text="Cancelar" onClick={() => navigate(-1)} />
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
