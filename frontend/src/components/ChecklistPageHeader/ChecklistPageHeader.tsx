import { ArrowLeft } from "lucide-react";
import "./ChecklistPageHeader.css";

export type MetaItem = {
  label: string;
  value: React.ReactNode;
};

type Props = {
  title: string;
  metaItems: MetaItem[];
  status: string;
  statusLabel: string;
  onVoltar: () => void;
};

export default function ChecklistPageHeader({
  title,
  metaItems,
  status,
  statusLabel,
  onVoltar,
}: Props) {
  return (
    <div className="checklist-page-header">
      <button type="button" className="checklist-page-header__voltar" onClick={onVoltar}>
        <ArrowLeft size={18} />
        Voltar
      </button>
      <div className="checklist-page-header__titulo">
        <h1>{title}</h1>
        <div className="checklist-page-header__meta">
          {metaItems.map((item) => (
            <span key={item.label}>
              <strong>{item.label}:</strong> {item.value}
            </span>
          ))}
        </div>
      </div>
      <div className={`checklist-page-header__badge checklist-page-header__badge--${status.toLowerCase()}`}>
        {statusLabel}
      </div>
    </div>
  );
}
