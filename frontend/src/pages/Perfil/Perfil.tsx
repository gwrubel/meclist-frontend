import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./Perfil.css";

export default function Perfil() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  const requisitosSenha = useMemo(
    () => [
      { label: "Pelo menos 8 caracteres", valido: novaSenha.length >= 8 },
      { label: "Uma letra maiúscula", valido: /[A-Z]/.test(novaSenha) },
      { label: "Uma letra minúscula", valido: /[a-z]/.test(novaSenha) },
      { label: "Um número", valido: /\d/.test(novaSenha) },
    ],
    [novaSenha]
  );

  const nomeExibicao = user?.nome || "Administrador";
  const inicial = (nomeExibicao || user?.email || "A").charAt(0).toUpperCase();

  function handleAtualizarEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailNormalizado = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (emailNormalizado === user?.email?.toLowerCase()) {
      toast.info("O e-mail informado já é o e-mail atual.");
      return;
    }

    toast.info("Validação concluída. A alteração será habilitada quando o endpoint estiver disponível.");
  }

  function handleAlterarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!senhaAtual) {
      toast.error("Informe sua senha atual.");
      return;
    }
    if (!requisitosSenha.every((requisito) => requisito.valido)) {
      toast.error("A nova senha ainda não atende aos requisitos de segurança.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("A confirmação não corresponde à nova senha.");
      return;
    }
    if (novaSenha === senhaAtual) {
      toast.error("A nova senha deve ser diferente da senha atual.");
      return;
    }

    toast.info("Validação concluída. A alteração será habilitada quando o endpoint estiver disponível.");
  }

  return (
    <main className="profile-page">
      <section className="profile-hero-card">
        <div className="profile-hero-copy">
          <span className="dashboard-page__eyebrow">Conta do administrador</span>
          <h1>Meu perfil</h1>
          <p>Consulte seus dados de acesso e mantenha as credenciais da conta atualizadas.</p>
        </div>

        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{inicial}</span>
          <span>
            <strong>{nomeExibicao}</strong>
            <small>{user?.email}</small>
          </span>
          <span className="profile-role-badge">Administrador</span>
        </div>
      </section>

      <div className="profile-integration-note" role="status">
        <ShieldCheck size={18} aria-hidden="true" />
        <span><strong>Interface preparada.</strong> As alterações serão persistidas após a disponibilização dos endpoints de perfil.</span>
      </div>

      <div className="profile-content-grid">
        <section className="profile-panel">
          <header className="profile-panel-header">
            <span className="profile-panel-icon" aria-hidden="true"><UserRound size={21} /></span>
            <div>
              <span className="dashboard-page__eyebrow">Informações básicas</span>
              <h2>Dados da conta</h2>
              <p>O e-mail também é utilizado para recuperação de acesso.</p>
            </div>
          </header>

          <form className="profile-form" onSubmit={handleAtualizarEmail}>
            <label className="profile-field" htmlFor="profile-email">
              <span>E-mail</span>
              <div className="profile-input-control">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <small>Use um endereço ao qual você tenha acesso.</small>
            </label>

            <button type="submit" className="profile-primary-action">Salvar e-mail</button>
          </form>
        </section>

        <section className="profile-panel profile-security-panel">
          <header className="profile-panel-header">
            <span className="profile-panel-icon" aria-hidden="true"><ShieldCheck size={21} /></span>
            <div>
              <span className="dashboard-page__eyebrow">Segurança</span>
              <h2>Alterar senha</h2>
              <p>Confirme a senha atual antes de definir uma nova.</p>
            </div>
          </header>

          <form className="profile-form" onSubmit={handleAlterarSenha}>
            <label className="profile-field" htmlFor="current-password">
              <span>Senha atual</span>
              <div className="profile-input-control">
                <ShieldCheck size={18} aria-hidden="true" />
                <input
                  id="current-password"
                  type={mostrarSenhas ? "text" : "password"}
                  value={senhaAtual}
                  onChange={(event) => setSenhaAtual(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            <label className="profile-field" htmlFor="new-password">
              <span>Nova senha</span>
              <div className="profile-input-control">
                <ShieldCheck size={18} aria-hidden="true" />
                <input
                  id="new-password"
                  type={mostrarSenhas ? "text" : "password"}
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            <label className="profile-field" htmlFor="confirm-password">
              <span>Confirmar nova senha</span>
              <div className="profile-input-control">
                <ShieldCheck size={18} aria-hidden="true" />
                <input
                  id="confirm-password"
                  type={mostrarSenhas ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            <button
              type="button"
              className="profile-password-visibility"
              onClick={() => setMostrarSenhas((atual) => !atual)}
            >
              {mostrarSenhas ? <EyeOff size={17} /> : <Eye size={17} />}
              {mostrarSenhas ? "Ocultar senhas" : "Mostrar senhas"}
            </button>

            <ul className="profile-password-rules" aria-label="Requisitos da nova senha">
              {requisitosSenha.map((requisito) => (
                <li className={requisito.valido ? "is-valid" : ""} key={requisito.label}>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {requisito.label}
                </li>
              ))}
            </ul>

            <button type="submit" className="profile-primary-action">Alterar senha</button>
          </form>
        </section>
      </div>
    </main>
  );
}
