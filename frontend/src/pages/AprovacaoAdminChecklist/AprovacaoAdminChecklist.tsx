import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ModalConfirmacaoFluxoManual from "../../components/ModalConfirmacaoFluxoManual/ModalConfirmacaoFluxoManual";
import { useAuth } from "../../contexts/AuthContext";
import { useAprovacaoAdmin } from "./useAprovacaoAdmin";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import { formatCurrency, formatarDataHora, CHECKLIST_STATUS_LABEL } from "../../utils/formatUtils";
import AprovacaoAdminAcoes from "./AprovacaoAdminAcoes";
import AprovacaoAdminItens from "./AprovacaoAdminItens";
import AprovacaoAdminFooter from "./AprovacaoAdminFooter";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { formatarPlaca } from "../../utils/maskUtils";
import "./AprovacaoAdminChecklist.css";

export default function AprovacaoAdminChecklist() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab =
    location.state && typeof location.state === "object"
      ? (location.state as { returnTab?: string }).returnTab ?? "aguardando-aprovacao"
      : "aguardando-aprovacao";

  const voltarParaLista = () => {
    navigate("/gerenciar-checklist", { state: { activeTab: returnTab } });
  };

  const {
    checklist,
    loading,
    iniciando,
    baixandoPdf,
    modalConfirmacao,
    setModalConfirmacao,
    decisoesProdutos,
    salvandoDecisoes,
    linkSeguroData,
    gerandoLinkCliente,
    linkCopiado,
    etapaAtual,
    etapaIdx,
    fluxoEncerrado,
    totalAprovados,
    totalReprovados,
    totalPendentes,
    steps,
    buscarChecklist,
    handleIniciarFluxo,
    handleBaixarPdf,
    handleGerarLinkCliente,
    copiarLinkCliente,
    definirDecisaoProduto,
    definirDecisaoItem,
    handleConfirmarDecisoes,
  } = useAprovacaoAdmin();

  if (loading) return <Loading />;
  if (!checklist) return null;

  const categoriasComItens = Object.values(checklist.itensPorCategoria).filter(
    (itens) => itens && itens.length > 0
  );
  const totalItens = categoriasComItens.reduce(
    (total, itens) => total + (itens?.length ?? 0),
    0
  );

  return (
    <div className="aprovacao-admin-container">
      <section className="aprovacao-admin-header-card">
        <span className="dashboard-page__eyebrow">Aprovação administrativa</span>
        <ChecklistPageHeader
          title={`Checklist #${checklist.checklistId}`}
          metaItems={[
            { label: "Placa", value: <span className="vehicle-plate">{formatarPlaca(checklist.placa)}</span> },
            { label: "Veículo", value: `${checklist.marca} ${checklist.modelo}` },
            { label: "Criado em", value: formatarDataHora(checklist.criadoEm) },
            { label: "Valor total", value: formatCurrency(checklist.valorTotal) },
          ]}
          status={checklist.status}
          statusLabel={CHECKLIST_STATUS_LABEL[checklist.status] ?? checklist.status}
          onVoltar={voltarParaLista}
        />
        <p className="aprovacao-admin-header-description">
          Revise a proposta e escolha entre a aprovação direta no aplicativo ou o atendimento assistido pelo administrador.
        </p>
      </section>

      <section className="aprovacao-admin-fluxo-card">
        <header className="aprovacao-admin-section-header">
          <span className="aprovacao-admin-section-icon" aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <div>
            <span className="dashboard-page__eyebrow">Forma de atendimento</span>
            <h2>Como o cliente vai aprovar?</h2>
            <p>Escolha o caminho adequado conforme a forma de atendimento do cliente.</p>
          </div>
        </header>

        <AprovacaoAdminAcoes
          etapaAtual={etapaAtual}
          etapaIdx={etapaIdx}
          fluxoEncerrado={fluxoEncerrado}
          gerandoLinkCliente={gerandoLinkCliente}
          iniciando={iniciando}
          baixandoPdf={baixandoPdf}
          steps={steps}
          linkSeguroData={linkSeguroData}
          linkCopiado={linkCopiado}
          onGerarLink={handleGerarLinkCliente}
          onCopiarLink={copiarLinkCliente}
          onIniciarFluxo={handleIniciarFluxo}
          onBaixarPdf={handleBaixarPdf}
          onRegistrarConfirmacao={() => setModalConfirmacao(true)}
        />
      </section>

      <section className="aprovacao-admin-itens-section">
        <header className="aprovacao-admin-section-header">
          <span className="aprovacao-admin-section-icon" aria-hidden="true">
            <ClipboardCheck size={22} />
          </span>
          <div>
            <span className="dashboard-page__eyebrow">Revisão detalhada</span>
            <h2>Itens para decisão</h2>
            <p>{totalItens} {totalItens === 1 ? "item" : "itens"} em {categoriasComItens.length} {categoriasComItens.length === 1 ? "parte do veículo" : "partes do veículo"}.</p>
          </div>
        </header>

        <AprovacaoAdminItens
          itensPorCategoria={checklist.itensPorCategoria}
          decisoesProdutos={decisoesProdutos}
          fluxoEncerrado={fluxoEncerrado}
          etapaAtual={etapaAtual}
          onDefinirDecisaoProduto={definirDecisaoProduto}
          onDefinirDecisaoItem={definirDecisaoItem}
        />
      </section>

      {!fluxoEncerrado && etapaAtual === "CONFIRMACAO_REGISTRADA" && (
        <AprovacaoAdminFooter
          totalAprovados={totalAprovados}
          totalReprovados={totalReprovados}
          totalPendentes={totalPendentes}
          salvandoDecisoes={salvandoDecisoes}
          onConfirmar={handleConfirmarDecisoes}
        />
      )}

      {modalConfirmacao && (
        <ModalConfirmacaoFluxoManual
          checklistId={checklist.checklistId}
          token={token!}
          onClose={() => setModalConfirmacao(false)}
          onSuccess={() => {
            setModalConfirmacao(false);
            buscarChecklist();
          }}
        />
      )}
    </div>
  );
}
