import { useCallback, useEffect, useState } from "react";
import Modal from "../../layouts/Modal/Modal";
import Loading from "../Loading/Loading";
import { buildApiUrl } from "../../config/api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { aplicarMascaraTelefone } from "../../utils/maskUtils";
import { tMecanico } from "../../types/Mecanico";
import "./ModalEncaminharMecanico.css";

interface ModalEncaminharMecanicoProps {
  checklistId: number;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEncaminharMecanico({
  checklistId,
  token,
  isOpen,
  onClose,
  onSuccess,
}: ModalEncaminharMecanicoProps) {
  const [mecanicos, setMecanicos] = useState<tMecanico[]>([]);
  const [loading, setLoading] = useState(false);
  const [vinculando, setVinculando] = useState<number | null>(null);

  const buscarMecanicos = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(buildApiUrl("/mecanicos"));
      url.searchParams.append("situacao", "ATIVO");
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Erro ao buscar mecânicos");
      const data = await response.json();
      setMecanicos(data.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar mecânicos";
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) buscarMecanicos();
  }, [isOpen, buscarMecanicos]);

  const handleVincular = async (mecanicoId: number) => {
    try {
      setVinculando(mecanicoId);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/servico`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mecanicoId }),
        }
      );
      if (response.status === 204) {
        showSuccessToast("Serviço encaminhado com sucesso.");
        onSuccess();
        return;
      }
      showErrorToast("Erro ao encaminhar serviço. Tente novamente.");
    } catch {
      showErrorToast("Erro ao encaminhar serviço. Tente novamente.");
    } finally {
      setVinculando(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Víncular Serviço a mecânico">
      {loading ? (
        <Loading />
      ) : mecanicos.length === 0 ? (
        <p className="encaminhar-mecanico-empty">
          Nenhum mecânico ativo encontrado.
        </p>
      ) : (
        <ul className="encaminhar-mecanico-lista">
          {mecanicos.map((mecanico) => (
            <li key={mecanico.id} className="encaminhar-mecanico-item">
              <div className="encaminhar-mecanico-info">
                <span className="encaminhar-mecanico-nome">{mecanico.nome}</span>
                <span className="encaminhar-mecanico-telefone">
                  {aplicarMascaraTelefone(mecanico.telefone)}
                </span>
              </div>
              <button
                type="button"
                className="btn-vincular"
                disabled={vinculando !== null}
                onClick={() => handleVincular(mecanico.id)}
              >
                {vinculando === mecanico.id ? "Vinculando..." : "Vincular"}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="encaminhar-mecanico-actions">
        <button
          type="button"
          className="btn-secundario"
          onClick={onClose}
          disabled={vinculando !== null}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
