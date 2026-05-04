import { ClipboardCheck, FileText, Link2, MessageSquare } from "lucide-react";
import { EtapaFluxoManual } from "../../types/Checklist";
import { etapaIndex } from "./aprovacaoAdminUtils";

type Props = {
  etapaAtual: EtapaFluxoManual;
  etapaIdx: number;
  fluxoEncerrado: boolean;
  gerandoLinkCliente: boolean;
  iniciando: boolean;
  baixandoPdf: boolean;
  onGerarLink: () => void;
  onIniciarFluxo: () => void;
  onBaixarPdf: () => void;
  onRegistrarConfirmacao: () => void;
};

export default function AprovacaoAdminAcoes({
  etapaAtual,
  etapaIdx,
  fluxoEncerrado,
  gerandoLinkCliente,
  iniciando,
  baixandoPdf,
  onGerarLink,
  onIniciarFluxo,
  onBaixarPdf,
  onRegistrarConfirmacao,
}: Props) {
  if (fluxoEncerrado) return null;

  return (
    <div className="aprovacao-admin-acoes">
      <button
        type="button"
        className="btn-acao-manual btn-link-cliente"
        onClick={onGerarLink}
        disabled={gerandoLinkCliente}
      >
        <Link2 size={16} />
        {gerandoLinkCliente ? "Gerando link..." : "Gerar link seguro"}
      </button>

      {etapaAtual === "NAO_INICIADO" && (
        <button
          type="button"
          className="btn-acao-manual btn-iniciar"
          onClick={onIniciarFluxo}
          disabled={iniciando}
        >
          <ClipboardCheck size={16} />
          {iniciando ? "Iniciando..." : "Conduzir aprovação manualmente"}
        </button>
      )}

      {etapaIdx >= etapaIndex("INICIADO") && etapaAtual !== "CONCLUIDO" && (
        <>
          <button
            type="button"
            className="btn-acao-manual btn-pdf"
            onClick={onBaixarPdf}
            disabled={baixandoPdf}
          >
            <FileText size={16} />
            {baixandoPdf ? "Gerando PDF..." : "Baixar PDF da proposta"}
          </button>

          {(etapaAtual === "INICIADO" || etapaAtual === "PDF_GERADO") && (
            <button
              type="button"
              className="btn-acao-manual btn-confirmacao"
              onClick={onRegistrarConfirmacao}
            >
              <MessageSquare size={16} />
              Registrar confirmação do cliente
            </button>
          )}

          {etapaAtual === "CONFIRMACAO_REGISTRADA" && (
            <div className="aprovacao-admin-hint-decisao">
              Defina a decisão por produto nos cards abaixo e confirme no final da página.
            </div>
          )}
        </>
      )}
    </div>
  );
}
