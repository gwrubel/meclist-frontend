import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import InputCustom from "../../components/InputCustom/InputCustom";
import Loading from "../../components/Loading/Loading";
import logo from "../../assets/logo.svg";
import checkbox from "../../assets/Checked Checkbox.svg";
import { buildApiUrl } from "../../config/api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import "./definirSenha.css";

type DefinirSenhaForm = {
  senha: string;
  repetirSenha: string;
};

function DefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState<DefinirSenhaForm>({
    senha: "",
    repetirSenha: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showErrorToast("Token inválido ou ausente na URL.");
      return;
    }

    if (formData.senha !== formData.repetirSenha) {
      showErrorToast("As senhas não conferem.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/adms/definir-senha"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          senha: formData.senha,
          novaSenha: formData.senha,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        showSuccessToast(data?.message || "Senha redefinida com sucesso.");
        navigate("/");
      } else {
        const message = data?.message || "Não foi possível redefinir a senha.";
        showErrorToast(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("Erro de conexão. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page definir-senha-page">
      <div className="login-container definir-senha-container">
        <div className="login-box definir-senha-box">
          <header className="login-header">
            <img src={logo} alt="MecList logo" className="logo" />
            <h3>Definir nova senha</h3>
            <p>Crie uma nova senha para acessar o sistema</p>
            <hr />
          </header>

          {token ? (
            <form onSubmit={handleSubmit}>
              <InputCustom
                type="password"
                placeholder="Nova senha"
                name="senha"
                required
                value={formData.senha}
                onChange={handleChange}
              />

              <InputCustom
                type="password"
                placeholder="Repita a nova senha"
                name="repetirSenha"
                required
                value={formData.repetirSenha}
                onChange={handleChange}
              />

              {isLoading ? <Loading /> : <Button text="Salvar nova senha" type="submit" />}

              <Link to="/" className="forgot-password">
                Voltar para login
              </Link>
            </form>
          ) : (
            <div className="definir-senha-token-invalido">
              <p>O link de redefinição está inválido ou expirado.</p>
              <Link to="/adm/recuperar-senha" className="forgot-password">
                Solicitar novo link
              </Link>
            </div>
          )}
        </div>

        <div className="info-box">
          <div className="info-header">
            <h2>Controle <span>Total</span></h2>
            <h2>Da Sua <span>Mecânica</span></h2>
          </div>

          <div className="info-list">
            <ul>
              <li>
                <img src={checkbox} alt="Checkbox" /> <p>Gestão de clientes</p>
              </li>
              <li>
                <img src={checkbox} alt="Checkbox" /> <p>Serviços e Ordens</p>
              </li>
              <li>
                <img src={checkbox} alt="Checkbox" /> <p>Controle de Mecânicos</p>
              </li>
              <li>
                <img src={checkbox} alt="Checkbox" /> <p>Faturamento e Custos</p>
              </li>
              <li>
                <img src={checkbox} alt="Checkbox" /> <p>Transparência Total</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefinirSenha;
