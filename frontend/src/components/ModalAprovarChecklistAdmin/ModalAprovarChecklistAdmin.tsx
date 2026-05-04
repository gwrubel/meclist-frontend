import { useState, useMemo } from "react";
import Modal from "../../layouts/Modal/Modal";
import { CategoriaParteVeiculo } from "../../types/Item";
import { ItemAprovacaoAdmin } from "../../types/Checklist";
import { buildApiUrl } from "../../config/api";
import { toast } from "react-toastify";
import "./ModalAprovarChecklistAdmin.css";

interface ProdutoState {
  checklistProdutoId: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  marca: string | null;
  aprovado: boolean;
}

interface ModalAprovarChecklistAdminProps {
  checklistId: number;
  token: string;
  itensPorCategoria: Partial<Record<CategoriaParteVeiculo, ItemAprovacaoAdmin[]>>;
  onClose: () => void;
  onSuccess: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ModalAprovarChecklistAdmin({
  checklistId,
  token,
  itensPorCategoria,
  onClose,
  onSuccess,
}: ModalAprovarChecklistAdminProps) {
  const todosProdutos = useMemo<ProdutoState[]>(() => {
    const acc: ProdutoState[] = [];
    Object.values(itensPorCategoria).forEach((itens) => {
      itens?.forEach((item) => {
        item.produtos.forEach((p) => {
          acc.push({
            checklistProdutoId: p.checklistProdutoId,
            nomeProduto: p.nomeProduto,
            quantidade: p.quantidade,
            valorUnitario: p.valorUnitario,
            marca: p.marca,
            aprovado: p.aprovadoCliente ?? true,
          });
        });
      });
    });
    return acc;
  }, [itensPorCategoria]);

  const [produtos, setProdutos] = useState<ProdutoState[]>(todosProdutos);
  const [submitting, setSubmitting] = useState(false);

  const toggleProduto = (id: number) => {
    setProdutos((prev) =>
      prev.map((p) => (p.checklistProdutoId === id ? { ...p, aprovado: !p.aprovado } : p))
    );
  };

  const aprovarTodos = () => setProdutos((prev) => prev.map((p) => ({ ...p, aprovado: true })));
  const reprovarTodos = () => setProdutos((prev) => prev.map((p) => ({ ...p, aprovado: false })));

  const totalAprovados = produtos.filter((p) => p.aprovado).length;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const body = {
        produtos: produtos
          .filter((p) => p.aprovado)
          .map((p) => ({ checklistProdutoId: p.checklistProdutoId, aprovadoCliente: true })),
      };
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/fluxo-manual/aprovar`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (response.status === 204) {
        toast.success("Checklist aprovado com sucesso.");
        onSuccess();
        return;
      }
      if (response.status === 409) {
        toast.error("Etapa inválida: registre a confirmação do cliente antes de aprovar.");
        return;
      }
      toast.error("Erro ao aprovar checklist. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} header="Aprovar / Reprovar checklist">
      <div className="modal-aprovar-admin-container">
        <div className="modal-aprovar-admin-bulk-actions">
          <button type="button" className="btn-aprovar-todos" onClick={aprovarTodos}>
            Aprovar todos
          </button>
          <button type="button" className="btn-reprovar-todos" onClick={reprovarTodos}>
            Reprovar todos
          </button>
        </div>

        {produtos.length === 0 ? (
          <p className="modal-aprovar-admin-empty">Nenhum produto encontrado.</p>
        ) : (
          <ul className="modal-aprovar-admin-lista">
            {produtos.map((p) => (
              <li key={p.checklistProdutoId} className="modal-aprovar-admin-item">
                <label className="modal-aprovar-admin-label">
                  <input
                    type="checkbox"
                    checked={p.aprovado}
                    onChange={() => toggleProduto(p.checklistProdutoId)}
                  />
                  <span className="modal-aprovar-admin-nome">{p.nomeProduto}</span>
                  {p.marca && <span className="modal-aprovar-admin-marca">({p.marca})</span>}
                </label>
                <span className="modal-aprovar-admin-detalhes">
                  {p.quantidade}x &nbsp;{formatCurrency(p.valorUnitario)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-aprovar-admin-summary">
          <span>
            {totalAprovados} de {produtos.length} produto(s) aprovado(s)
          </span>
        </div>

        <div className="modal-aprovar-admin-actions">
          <button type="button" className="btn-secundario" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primario"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Salvando..." : "Confirmar decisão"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
