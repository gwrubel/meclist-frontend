import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Link2,
  MessageSquare,
  Smartphone,
  UserRoundCheck,
} from "lucide-react";
import { EtapaFluxoManual } from "../../types/Checklist";
import { etapaIndex, LinkSeguroAprovacaoData } from "./aprovacaoAdminUtils";
import AprovacaoAdminStepper, { AprovacaoStep } from "./AprovacaoAdminStepper";
import LinkSeguroCard from "./LinkSeguroCard";

type Props = {
  etapaAtual: EtapaFluxoManual;
  etapaIdx: number;
  fluxoEncerrado: boolean;
  gerandoLinkCliente: boolean;
  iniciando: boolean;
  baixandoPdf: boolean;
  steps: AprovacaoStep[];
  linkSeguroData: LinkSeguroAprovacaoData | null;
  linkCopiado: boolean;
  onGerarLink: () => void;
  onCopiarLink: (link: string) => void;
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
  steps,
  linkSeguroData,
  linkCopiado,
  onGerarLink,
  onCopiarLink,
  onIniciarFluxo,
  onBaixarPdf,
  onRegistrarConfirmacao,
}: Props) {
  const fluxoManualIniciado = etapaIdx >= etapaIndex("INICIADO");

  return (
    <div className="aprovacao-admin-caminhos">
      <article className="aprovacao-admin-caminho aprovacao-admin-caminho--digital">
        <header className="aprovacao-admin-caminho-header">
          <span className="aprovacao-admin-caminho-icon" aria-hidden="true">
            <Smartphone size={22} />
          </span>
          <div>
            <span className="aprovacao-admin-caminho-tag">Cliente no aplicativo</span>
            <h3>Aprovação pelo cliente</h3>
          </div>
        </header>

        <p className="aprovacao-admin-caminho-descricao">
          Para quem já utiliza a Meclist. Gere um acesso seguro e envie o link para o
          cliente concluir a aprovação diretamente pelo aplicativo.
        </p>

        <div className="aprovacao-admin-caminho-responsavel">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span><strong>Quem registra:</strong> o próprio cliente.</span>
        </div>

        <button
          type="button"
          className="btn-acao-manual btn-link-cliente"
          onClick={onGerarLink}
          disabled={gerandoLinkCliente || fluxoEncerrado}
        >
          <Link2 size={16} />
          {gerandoLinkCliente ? "Gerando link..." : "Gerar link para o cliente"}
        </button>

        {linkSeguroData && (
          <LinkSeguroCard
            linkSeguroData={linkSeguroData}
            linkCopiado={linkCopiado}
            onCopiar={onCopiarLink}
          />
        )}
      </article>

      <article className={`aprovacao-admin-caminho aprovacao-admin-caminho--assistido ${
        fluxoManualIniciado ? "aprovacao-admin-caminho--em-andamento" : ""
      }`}>
        <header className="aprovacao-admin-caminho-header">
          <span className="aprovacao-admin-caminho-icon" aria-hidden="true">
            <UserRoundCheck size={22} />
          </span>
          <div>
            <span className="aprovacao-admin-caminho-tag">Atendimento por outro canal</span>
            <h3>Aprovação assistida pelo administrador</h3>
          </div>
        </header>

        <p className="aprovacao-admin-caminho-descricao">
          Para clientes que não utilizam o aplicativo. Apresente a proposta em PDF,
          receba a resposta por WhatsApp, telefone ou presencialmente e registre a
          decisão no sistema.
        </p>

        <div className="aprovacao-admin-caminho-responsavel">
          <ClipboardCheck size={17} aria-hidden="true" />
          <span><strong>Quem registra:</strong> o administrador, conforme o retorno do cliente.</span>
        </div>

        {!fluxoManualIniciado && !fluxoEncerrado && (
          <button
            type="button"
            className="btn-acao-manual btn-iniciar"
            onClick={onIniciarFluxo}
            disabled={iniciando}
          >
            <ClipboardCheck size={16} />
            {iniciando ? "Iniciando..." : "Iniciar aprovação assistida"}
          </button>
        )}

        {fluxoManualIniciado && (
          <div className="aprovacao-admin-andamento-manual">
            <span className="aprovacao-admin-andamento-titulo">Andamento da aprovação assistida</span>
            <AprovacaoAdminStepper steps={steps} fluxoEncerrado={fluxoEncerrado} />

            {!fluxoEncerrado && etapaAtual !== "CONCLUIDO" && (
              <div className="aprovacao-admin-acoes">
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
                    Registrar retorno do cliente
                  </button>
                )}

                {etapaAtual === "CONFIRMACAO_REGISTRADA" && (
                  <div className="aprovacao-admin-hint-decisao">
                    O retorno foi registrado. Defina as decisões nos itens abaixo e confirme no final da página.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {fluxoEncerrado && !fluxoManualIniciado && (
          <div className="aprovacao-admin-caminho-encerrado">
            <CheckCircle2 size={17} aria-hidden="true" />
            Esta aprovação já foi concluída pelo fluxo do cliente.
          </div>
        )}
      </article>
    </div>
  );
}
