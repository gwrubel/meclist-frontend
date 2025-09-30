import { useState } from "react";
import { tClienteCadastro } from "../../types/Cliente";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalCadastroCliente.css";
import { useAuth } from "../../contexts/AuthContext";
import { showErrorToast, showSuccessToast } from "../../utils/toast";


interface CadastroDeClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSucess?: () => void;
}

export default function ModalCadastroCliente({ isOpen, onClose, onSucess }: CadastroDeClienteProps) {
  const [formData, setFormData] = useState<tClienteCadastro>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    senha: '',
  });
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);


  function limparMascara(valor: string) {
    return valor.replace(/\D/g, "");
  }



  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== confirmarSenha) {
      setErrors({ confirmarSenha: "As senhas não coincidem" });
      return;
    }

    const cleanedData = {
      ...formData,
      cpf: limparMascara(formData.cpf), // remove tudo que não for número
      telefone: limparMascara(formData.telefone), // remove tudo que não for número
    };

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:8080/clientes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
        body: JSON.stringify(cleanedData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          showErrorToast(data.message || "Erro ao realizar cadastro");
        } else {
          setErrors({ geral: data.message || "Erro ao realizar cadastro" });
        }
        return;
      }
      showSuccessToast(data.message);
      onSucess?.();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro:", error.message);
        showErrorToast(error.message);
        setErrors({ geral: error.message });
      } else {
        console.error("Erro desconhecido:", error);
        setErrors({ geral: "Erro de conexão. Tente novamente." });
        showErrorToast("Erro de conexão. Tente novamente.");
      }
    }
    finally{
      setIsSubmitting(false);
    }
    
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Cadastro de Cliente" >
      <form onSubmit={handleSubmit} className="form-cadastro-cliente">
        <InputCustom label="Nome" name="nome" type="text" value={formData.nome} onChange={handleFormChange} required error={errors.nome} placeholder="Nome completo" />
        <InputCustom label="CPF" name="cpf" type="text" mask="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleFormChange} required error={errors.cpf} />
        <InputCustom label="Telefone" name="telefone" type="text" mask="phone" value={formData.telefone} onChange={handleFormChange} required error={errors.telefone} placeholder="(00) 00000-0000" />
        <InputCustom label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required error={errors.email} placeholder="Digite o e-mail" />
        <InputCustom label="Endereço" name="endereco" type="text" value={formData.endereco} onChange={handleFormChange} required error={errors.endereco} placeholder="Digite o endereço do cliente" />
        <InputCustom label="Senha" name="senha" type="password" value={formData.senha} onChange={handleFormChange} required error={errors.senha} placeholder="Digite a senha" />
        <InputCustom label="Confirmar Senha" name="confirmarSenha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required error={errors.confirmarSenha} placeholder="Confirme a senha" />
        {errors.geral && <p className="error">{errors.geral}</p>}

        <div className="form-buttons">
          <button type="button" onClick={onClose}>Cancelar</button>
          <Button text={isSubmitting ? "Cadastrando..." : "Cadastrar"}  disabled={isSubmitting} secondary type="submit" />
        </div>
      </form>
    </Modal>
  );
}