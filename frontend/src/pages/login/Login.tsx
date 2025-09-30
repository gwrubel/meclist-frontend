import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./login.css";
import logo from "../../assets/logo.svg";
import checkbox from "../../assets/Checked Checkbox.svg";
import Button from "../../components/Button/Button";
import { useNavigate } from 'react-router-dom';
import InputCustom from "../../components/InputCustom/InputCustom";
import { tlogin } from "../../types/userLogin";
import Loading from "../../components/Loading/Loading";



function Login() {
    const navigate = useNavigate();
    const { login } = useAuth(); 
    const [formData, setFormData] = useState<tlogin>({ email: "", senha: "" });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
   
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Função que lida com o envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("Dados do formulário:", formData);

        // Envia uma requisição de login para o backend
        try {
            const response = await fetch("http://localhost:8080/adms/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // Envia os dados do formulário
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso no login, armazena o token ou outros dados conforme necessário
                login(data.token);
                navigate("/dashboard");
            } else {
                // Se houver erro no login, exibe a mensagem de erro
                setErrorMessage(data.message || "Erro ao fazer login. Tente novamente.");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Erro:", error.message);
                setErrorMessage(error.message);
            } else {
                console.error("Erro desconhecido:", error);
                setErrorMessage("Erro de conexão. Tente novamente.");
            }
        }
        finally {
            setIsLoading(false);
        }
        
    };

    useEffect(() => {
        // Limpa a mensagem de erro ao alterar os dados do formulário
        setErrorMessage("");    
    }, [formData]);

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
                        {errorMessage && <p className="error">{errorMessage}</p>}
                        {isLoading ? (
                            <Loading /> 
                        ) : (
                            <Button text="Entrar" />
                        )}
                        <a href="#" className="forgot-password">
                            Esqueceu a senha?
                        </a>
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
