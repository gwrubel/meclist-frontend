import { useState } from "react";
import {
  CheckCircle2,
  Handshake,
  Info,
  LoaderCircle,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Phone,
} from "lucide-react";
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

const CANAIS = [
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "EMAIL", label: "E-mail", icon: Mail },
  { value: "TELEFONE", label: "Telefone", icon: Phone },
  { value: "PRESENCIAL", label: "Presencial", icon: Handshake },
  { value: "OUTRO", label: "Outro canal", icon: MoreHorizontal },
] satisfies { value: CanalConfirmacao; label: string; icon: typeof MessageCircle }[];

export default function ModalConfirmacaoFluxoManual({
  checklistId,
  token,
  onClose,
  onSuccess,
}: ModalConfirmacaoFluxoManualProps) {
  const [canal, setCanal] = useState<CanalConfirmacao | "">("");
  const [observacao, setObservacao] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canal) {
      toast.error("Selecione por onde o cliente enviou o retorno.");
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
          body: JSON.stringify({
            canalConfirmacao: canal,
            observacao: observacao.trim() || undefined,
          }),
        }
      );

      if (response.status === 204) {
        toast.success("Retorno do cliente registrado com sucesso.");
        onSuccess();
        return;
      }
      if (response.status === 409) {
        toast.error("Esta confirmação não está disponível na etapa atual.");
        return;
      }
      if (response.status === 400) {
        toast.error("Dados inválidos. Revise as informações e tente novamente.");
        return;
      }
      toast.error("Não foi possível registrar o retorno. Tente novamente.");
    } catch {
      toast.error("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} header="Registrar retorno do cliente">
      <form className="modal-confirmacao-form" onSubmit={handleSubmit}>
        <div className="modal-confirmacao-contexto">
          <span className="modal-confirmacao-contexto-icon" aria-hidden="true">
            <CheckCircle2 size={22} />
          </span>
          <div>
            <span className="modal-confirmacao-eyebrow">Checklist #{checklistId}</span>
            <strong>Confirme um retorno recebido fora do aplicativo</strong>
            <p>
              Use este registro somente após o cliente responder por um dos canais abaixo.
            </p>
          </div>
        </div>

        <fieldset className="modal-confirmacao-canais">
          <legend>Por onde o cliente respondeu?</legend>
          <p>Selecione o canal utilizado para manter o histórico do atendimento.</p>

          <div className="modal-confirmacao-canais-grid">
            {CANAIS.map(({ value, label, icon: Icon }) => (
              <label
                className={`modal-confirmacao-canal ${canal === value ? "modal-confirmacao-canal--selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="canal-confirmacao"
                  value={value}
                  checked={canal === value}
                  onChange={() => setCanal(value)}
                  required
                />
                <span className="modal-confirmacao-canal-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span>{label}</span>
                {canal === value && <CheckCircle2 className="modal-confirmacao-canal-check" size={17} aria-hidden="true" />}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="modal-confirmacao-field">
          <div className="modal-confirmacao-label-row">
            <label htmlFor="observacao">Detalhes do retorno</label>
            <span className="modal-confirmacao-opcional">Opcional</span>
          </div>
          <textarea
            id="observacao"
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Ex.: Cliente confirmou por mensagem de voz às 14h e solicitou a troca apenas dos itens aprovados."
          />
          <div className="modal-confirmacao-field-footer">
            <span>Registre informações úteis para consultas futuras.</span>
            <span>{observacao.length}/1000</span>
          </div>
        </div>

        <div className="modal-confirmacao-aviso">
          <Info size={17} aria-hidden="true" />
          <span>
            Ao registrar, os itens serão liberados para que o administrador informe as decisões recebidas do cliente.
          </span>
        </div>

        <div className="modal-confirmacao-actions">
          <button type="button" className="btn-secundario" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primario" disabled={submitting || !canal}>
            {submitting ? <LoaderCircle className="modal-confirmacao-spinner" size={17} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" />}
            {submitting ? "Registrando..." : "Registrar retorno"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
