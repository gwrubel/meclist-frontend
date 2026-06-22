import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import ModalConfirmacaoFluxoManual from "../../components/ModalConfirmacaoFluxoManual/ModalConfirmacaoFluxoManual";
import { useAuth } from "../../contexts/AuthContext";
import { useAprovacaoAdmin } from "./useAprovacaoAdmin";
import ChecklistPageHeader from "../../components/ChecklistPageHeader/ChecklistPageHeader";
import { formatCurrency, formatarDataHora, CHECKLIST_STATUS_LABEL } from "../../utils/formatUtils";
import AprovacaoAdminStepper from "./AprovacaoAdminStepper";
import AprovacaoAdminAcoes from "./AprovacaoAdminAcoes";
import LinkSeguroCard from "./LinkSeguroCard";
import AprovacaoAdminItens from "./AprovacaoAdminItens";
import AprovacaoAdminFooter from "./AprovacaoAdminFooter";
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

  return (
    <div className="aprovacao-admin-container">
      <ChecklistPageHeader
        title={`Checklist #${checklist.checklistId}`}
        metaItems={[
          { label: "Placa", value: checklist.placa },
          { label: "Veículo", value: `${checklist.marca} ${checklist.modelo}` },
          { label: "Valor total", value: formatCurrency(checklist.valorTotal) },
          { label: "Criado em", value: formatarDataHora(checklist.criadoEm) },
        ]}
        status={checklist.status}
        statusLabel={CHECKLIST_STATUS_LABEL[checklist.status] ?? checklist.status}
        onVoltar={voltarParaLista}
      />

      <AprovacaoAdminStepper steps={steps} fluxoEncerrado={fluxoEncerrado} />

      <AprovacaoAdminAcoes
        etapaAtual={etapaAtual}
        etapaIdx={etapaIdx}
        fluxoEncerrado={fluxoEncerrado}
        gerandoLinkCliente={gerandoLinkCliente}
        iniciando={iniciando}
        baixandoPdf={baixandoPdf}
        onGerarLink={handleGerarLinkCliente}
        onIniciarFluxo={handleIniciarFluxo}
        onBaixarPdf={handleBaixarPdf}
        onRegistrarConfirmacao={() => setModalConfirmacao(true)}
      />

      {linkSeguroData && (
        <LinkSeguroCard
          linkSeguroData={linkSeguroData}
          linkCopiado={linkCopiado}
          onCopiar={copiarLinkCliente}
        />
      )}

      <AprovacaoAdminItens
        itensPorCategoria={checklist.itensPorCategoria}
        decisoesProdutos={decisoesProdutos}
        fluxoEncerrado={fluxoEncerrado}
        etapaAtual={etapaAtual}
        onDefinirDecisaoProduto={definirDecisaoProduto}
        onDefinirDecisaoItem={definirDecisaoItem}
      />

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
