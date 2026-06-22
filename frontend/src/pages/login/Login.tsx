import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./login.css";
import logo from "../../assets/logo.svg";
import checkbox from "../../assets/Checked Checkbox.svg";
import Button from "../../components/Button/Button";
import { Link, useNavigate } from 'react-router-dom';
import InputCustom from "../../components/InputCustom/InputCustom";
import { tlogin } from "../../types/userLogin";
import Loading from "../../components/Loading/Loading";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { buildApiUrl } from "../../config/api";



function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState<tlogin>({ email: "", senha: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
            const response = await fetch(buildApiUrl("/adms/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), 
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso no login, armazena o token ou outros dados conforme necessário
                login(data.data.token);
                showSuccessToast("Seja bem-vindo.");
                navigate("/dashboard");
            } else {
                // Erro no login
                const message = data.message || "Erro ao fazer login. Tente novamente.";
                showErrorToast(message);
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro:", error.message);
                showErrorToast(error.message);
            } else {
                console.error("Erro desconhecido:", error);
                showErrorToast("Erro de conexão. Tente novamente.");
            }
        }
        finally {
            setIsLoading(false);
        }

    };



    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <header className="login-header">
                        <img src={logo} alt="MecList logo" className="logo" />
                        <h3>Bem-vindos ao MecList</h3>
                        <p>Área de login da mecânica</p>
                        <hr />
                    </header>

                    <form onSubmit={handleSubmit}>
                        <InputCustom
                            type="text"
                            placeholder="Usuário"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <InputCustom
                            type="password"
                            placeholder="Password"
                            name="senha"
                            required
                            value={formData.senha}
                            onChange={handleChange}
                        />

                        {isLoading ? (
                            <Loading />
                        ) : (
                            <Button text="Entrar" />
                        )}
                        <Link to="/adm/recuperar-senha" className="forgot-password">
                            Esqueceu a senha?
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

export default Login;
