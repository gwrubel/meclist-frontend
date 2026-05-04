import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ChecklistAprovacaoAdminResponse, EtapaFluxoManual } from "../../types/Checklist";
import { buildApiUrl } from "../../config/api";
import { toast } from "react-toastify";
import {
  ETAPA_ORDEM,
  etapaIndex,
  LinkSeguroAprovacaoData,
} from "./aprovacaoAdminUtils";

export function useAprovacaoAdmin() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState<ChecklistAprovacaoAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [decisoesProdutos, setDecisoesProdutos] = useState<Record<number, boolean | null>>({});
  const [salvandoDecisoes, setSalvandoDecisoes] = useState(false);
  const [linkSeguroData, setLinkSeguroData] = useState<LinkSeguroAprovacaoData | null>(null);
  const [gerandoLinkCliente, setGerandoLinkCliente] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const buscarChecklist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/aprovacao`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 404) {
        toast.error("Checklist não encontrado.");
        navigate("/gerenciar-checklist");
        return;
      }
      if (response.status === 403) {
        toast.error("Acesso negado. Apenas administradores podem acessar este painel.");
        navigate("/gerenciar-checklist");
        return;
      }
      const json = await response.json();
      setChecklist(json.data ?? json);
    } finally {
      setLoading(false);
    }
  }, [checklistId, token, navigate]);

  useEffect(() => {
    buscarChecklist();
  }, [buscarChecklist]);

  useEffect(() => {
    if (!checklist) return;

    setDecisoesProdutos((prev) => {
      const proximasDecisoes: Record<number, boolean | null> = {};
      Object.values(checklist.itensPorCategoria).forEach((itens) => {
        itens?.forEach((item) => {
          item.produtos.forEach((produto) => {
            proximasDecisoes[produto.checklistProdutoId] =
              prev[produto.checklistProdutoId] ?? produto.aprovadoCliente ?? null;
          });
        });
      });
      return proximasDecisoes;
    });
  }, [checklist]);

  const etapaAtual: EtapaFluxoManual = checklist?.etapaFluxoManual ?? "NAO_INICIADO";
  const etapaIdx = etapaIndex(etapaAtual);
  const fluxoEncerrado = checklist?.status !== "AGUARDANDO_APROVACAO";

  const produtosChecklist = Object.values(checklist?.itensPorCategoria ?? {}).flatMap(
    (itens) => itens?.flatMap((item) => item.produtos) ?? []
  );

  const totalProdutos = produtosChecklist.length;
  const totalAprovados = produtosChecklist.filter(
    (produto) => decisoesProdutos[produto.checklistProdutoId] === true
  ).length;
  const totalReprovados = produtosChecklist.filter(
    (produto) => decisoesProdutos[produto.checklistProdutoId] === false
  ).length;
  const totalPendentes = totalProdutos - totalAprovados - totalReprovados;

  const handleIniciarFluxo = async () => {
    try {
      setIniciando(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/fluxo-manual/iniciar`),
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 204) {
        toast.success("Fluxo manual iniciado.");
        await buscarChecklist();
        return;
      }
      if (response.status === 409) {
        toast.error("O fluxo manual já foi iniciado anteriormente.");
        await buscarChecklist();
        return;
      }
      toast.error("Erro ao iniciar fluxo. Tente novamente.");
    } finally {
      setIniciando(false);
    }
  };

  const handleBaixarPdf = async () => {
    try {
      setBaixandoPdf(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/fluxo-manual/proposta.pdf`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        toast.error("Erro ao gerar PDF. Verifique se o fluxo foi iniciado.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url);
      await buscarChecklist();
    } finally {
      setBaixandoPdf(false);
    }
  };

  const copiarLinkCliente = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopiado(true);
      toast.success("Link do cliente copiado.");
      window.setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      toast.info("Não foi possível copiar automaticamente. Copie o link exibido na tela.");
    }
  };

  const handleGerarLinkCliente = async () => {
    if (!checklist || gerandoLinkCliente || !token) return;

    try {
      setGerandoLinkCliente(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklist.checklistId}/link-aprovacao-cliente`),
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await response.json().catch(() => null);
      const data = json?.data as LinkSeguroAprovacaoData | undefined;

      if (response.ok && data?.link && data?.expiraEm) {
        setLinkSeguroData(data);
        setLinkCopiado(false);
        toast.success(json?.message ?? "Link seguro de aprovação gerado e enviado ao cliente.");
        return;
      }
      if (response.status === 409) {
        toast.error(json?.message ?? "Checklist não está disponível para gerar link de aprovação.");
        return;
      }
      if (response.status === 403) {
        toast.error("Você não tem permissão para gerar link de aprovação.");
        return;
      }
      if (response.status === 404) {
        toast.error("Checklist não encontrado.");
        return;
      }
      if (response.status === 401) {
        toast.error("Sessão inválida. Faça login novamente.");
        return;
      }
      toast.error(json?.message ?? "Erro ao gerar link seguro. Tente novamente.");
    } finally {
      setGerandoLinkCliente(false);
    }
  };

  const definirDecisaoProduto = (checklistProdutoId: number, aprovado: boolean) => {
    setDecisoesProdutos((prev) => ({ ...prev, [checklistProdutoId]: aprovado }));
  };

  const definirDecisaoItem = (checklistProdutoIds: number[], aprovado: boolean) => {
    setDecisoesProdutos((prev) => {
      const proximas = { ...prev };
      checklistProdutoIds.forEach((id) => {
        proximas[id] = aprovado;
      });
      return proximas;
    });
  };

  const handleConfirmarDecisoes = async () => {
    if (!checklist || salvandoDecisoes) return;

    const checklistProdutoIds = produtosChecklist.map((produto) => produto.checklistProdutoId);
    const existemPendentes = checklistProdutoIds.some((id) => decisoesProdutos[id] == null);

    if (existemPendentes) {
      toast.error("Defina a decisão de todos os produtos antes de confirmar.");
      return;
    }

    const produtosAprovados = checklistProdutoIds
      .filter((id) => decisoesProdutos[id] === true)
      .map((id) => ({ checklistProdutoId: id, aprovadoCliente: true }));

    try {
      setSalvandoDecisoes(true);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/fluxo-manual/aprovar`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ produtos: produtosAprovados }),
        }
      );

      if (response.status === 204) {
        toast.success("Decisões registradas com sucesso.");
        navigate("/gerenciar-checklist");
        return;
      }
      if (response.status === 409) {
        toast.error("Etapa inválida: registre a confirmação do cliente antes de aprovar.");
        return;
      }
      toast.error("Erro ao confirmar decisão do checklist. Tente novamente.");
    } finally {
      setSalvandoDecisoes(false);
    }
  };

  // Steps for stepper (computed here so the page component stays thin)
  const etapaIdxFinal = ETAPA_ORDEM.indexOf("CONCLUIDO");
  const steps = [
    { id: 1, label: "Iniciar fluxo manual", concluido: etapaIdx >= etapaIndex("INICIADO"), icon: <ClipboardCheck size={20} /> },
    { id: 2, label: "Gerar PDF da proposta", concluido: etapaIdx >= etapaIndex("PDF_GERADO"), icon: <FileText size={20} /> },
    { id: 3, label: "Registrar confirmação do cliente", concluido: etapaIdx >= etapaIndex("CONFIRMACAO_REGISTRADA"), icon: <MessageSquare size={20} /> },
    { id: 4, label: "Aprovar / Reprovar checklist", concluido: etapaIdx >= etapaIdxFinal, icon: <ShieldCheck size={20} /> },
  ];

  return {
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
  };
}
