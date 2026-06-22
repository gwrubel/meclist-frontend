import { CheckCircle } from "lucide-react";

export type AprovacaoStep = {
  id: number;
  label: string;
  concluido: boolean;
  icon?: React.ReactNode;
};

type Props = {
  steps: AprovacaoStep[];
  fluxoEncerrado: boolean;
};

export default function AprovacaoAdminStepper({ steps, fluxoEncerrado }: Props) {
  const primeiroNaoConcluido = steps.findIndex((s) => !s.concluido);

  return (
    <div className="aprovacao-admin-stepper">
      {steps.map((step, idx) => {
        const ativo = !fluxoEncerrado && idx === primeiroNaoConcluido;
        return (
          <div
            key={step.id}
            className={`aprovacao-admin-step ${step.concluido ? "concluido" : ""} ${ativo ? "ativo" : ""}`}
          >
            <div className="aprovacao-admin-step-icon">
              {step.concluido ? <CheckCircle size={20} /> : step.icon}
            </div>
            <span className="aprovacao-admin-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
