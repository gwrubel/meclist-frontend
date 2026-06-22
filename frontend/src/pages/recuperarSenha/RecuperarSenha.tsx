import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button";
import InputCustom from "../../components/InputCustom/InputCustom";
import Loading from "../../components/Loading/Loading";
import logo from "../../assets/logo.svg";
import checkbox from "../../assets/Checked Checkbox.svg";
import { buildApiUrl } from "../../config/api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import "./recuperarSenha.css";

type RecuperarSenhaForm = {
  email: string;
};

function RecuperarSenha() {
  const [formData, setFormData] = useState<RecuperarSenhaForm>({ email: "" });
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
    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/adms/recuperar-senha"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        const message =
          data?.message ||
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";
        showSuccessToast(message);
        setFormData({ email: "" });
      } else {
        const message = data?.message || "Não foi possível solicitar recuperação de senha.";
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
    <div className="login-page recuperar-senha-page">
      <div className="login-container recuperar-senha-container">
        <div className="login-box recuperar-senha-box">
          <header className="login-header">
            <img src={logo} alt="MecList logo" className="logo" />
            <h3>Recuperar senha</h3>
            <p>Informe seu e-mail para receber o link de redefinição</p>
            <hr />
          </header>

          <form onSubmit={handleSubmit}>
            <InputCustom
              type="email"
              placeholder="Seu e-mail"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            {isLoading ? <Loading /> : <Button text="Enviar link" type="submit" />}

            <Link to="/" className="forgot-password">
              Voltar para login
            </Link>
          </form>
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

export default RecuperarSenha;
