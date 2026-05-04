import { CheckCircle } from "lucide-react";

type Props = {
  totalAprovados: number;
  totalReprovados: number;
  totalPendentes: number;
  salvandoDecisoes: boolean;
  onConfirmar: () => void;
};

export default function AprovacaoAdminFooter({
  totalAprovados,
  totalReprovados,
  totalPendentes,
  salvandoDecisoes,
  onConfirmar,
}: Props) {
  return (
    <div className="aprovacao-admin-footer-acoes">
      <span className="aprovacao-admin-resumo-decisao">
        {totalAprovados} aprovado(s) • {totalReprovados} reprovado(s) • {totalPendentes} pendente(s)
      </span>
      <button
        type="button"
        className="btn-acao-manual btn-aprovar"
        onClick={onConfirmar}
        disabled={salvandoDecisoes}
      >
        <CheckCircle size={16} />
        {salvandoDecisoes ? "Salvando..." : "Confirmar decisão do checklist"}
      </button>
    </div>
  );
}
