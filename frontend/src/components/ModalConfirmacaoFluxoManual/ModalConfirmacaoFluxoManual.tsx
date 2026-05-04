import { useState } from "react";
import Modal from "../../layouts/Modal/Modal";
import { CanalConfirmacao } from "../../types/Checklist";
import { buildApiUrl } from "../../config/api";
import { toast } from "react-toastify";
import "./ModalConfirmacaoFluxoManual.css";

interface ModalConfirmacaoFluxoManualProps {
  checklistId: number;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CANAIS: { value: CanalConfirmacao; label: string }[] = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "E-mail" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "OUTRO", label: "Outro" },
];

export default function ModalConfirmacaoFluxoManual({
  checklistId,
  token,
  onClose,
  onSuccess,
}: ModalConfirmacaoFluxoManualProps) {
  const [canal, setCanal] = useState<CanalConfirmacao | "">("");
  const [observacao, setObservacao] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canal) {
      toast.error("Selecione o canal de confirmação.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/fluxo-manual/confirmacao`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ canalConfirmacao: canal, observacao: observacao.trim() || undefined }),
        }
      );
      if (response.status === 204) {
        toast.success("Confirmação do cliente registrada com sucesso.");
        onSuccess();
        return;
      }
      if (response.status === 409) {
        toast.error("Operação inválida para a etapa atual do fluxo.");
        return;
      }
      if (response.status === 400) {
        toast.error("Dados inválidos. Verifique os campos e tente novamente.");
        return;
      }
      toast.error("Erro ao registrar confirmação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} header="Registrar confirmação do cliente">
      <form className="modal-confirmacao-form" onSubmit={handleSubmit}>
        <div className="modal-confirmacao-field">
          <label htmlFor="canal-confirmacao">Canal de confirmação *</label>
          <select
            id="canal-confirmacao"
            value={canal}
            onChange={(e) => setCanal(e.target.value as CanalConfirmacao)}
            required
          >
            <option value="">Selecione...</option>
            {CANAIS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-confirmacao-field">
          <label htmlFor="observacao">
            Observação <span className="modal-confirmacao-opcional">(opcional)</span>
          </label>
          <textarea
            id="observacao"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Ex: Cliente confirmou às 14h via mensagem de voz."
          />
          <span className="modal-confirmacao-chars">{observacao.length}/1000</span>
        </div>

        <div className="modal-confirmacao-actions">
          <button type="button" className="btn-secundario" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primario" disabled={submitting || !canal}>
            {submitting ? "Registrando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
