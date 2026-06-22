import { Copy } from "lucide-react";
import { LinkSeguroAprovacaoData, formatarDataHora } from "./aprovacaoAdminUtils";

type Props = {
  linkSeguroData: LinkSeguroAprovacaoData;
  linkCopiado: boolean;
  onCopiar: (link: string) => void;
};

export default function LinkSeguroCard({ linkSeguroData, linkCopiado, onCopiar }: Props) {
  return (
    <div className="aprovacao-admin-link-box">
      <div className="aprovacao-admin-link-box-texto">
        <strong>Acesso rápido do cliente</strong>
        <span>Envie este link somente ao cliente. O acesso é temporário e de uso único.</span>
        <span>
          Expira em: <strong>{formatarDataHora(linkSeguroData.expiraEm)}</strong>
        </span>
      </div>
      <div className="aprovacao-admin-link-box-acoes">
        <input
          type="text"
          value={linkSeguroData.link}
          readOnly
          className="aprovacao-admin-link-input"
        />
        <button
          type="button"
          className="btn-copiar-link"
          onClick={() => onCopiar(linkSeguroData.link)}
        >
          <Copy size={16} />
          Copiar
        </button>
        {linkCopiado && <span className="aprovacao-admin-link-copiado">Link copiado</span>}
      </div>
    </div>
  );
}
