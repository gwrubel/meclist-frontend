import { useState } from "react";
import { tClienteCadastro } from "../../types/Cliente";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalCadastroCliente.css";
import { useAuth } from "../../contexts/AuthContext";
import { showErrorToast } from "../../utils/toast";
import { SelectCustom } from "../Select/SelectCustom";

interface CadastroDeClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSucess?: () => void;
}

export default function ModalCadastroCliente({ isOpen, onClose, onSucess }: CadastroDeClienteProps) {
  const [formData, setFormData] = useState<tClienteCadastro>({
    nome: '',
    tipoDocumento: 'CPF',
    documento: '',
    telefone: '',
    email: '',
    endereco: '',
    senha: '',
  });
  
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function limparMascara(valor: string) {
    return valor.replace(/\D/g, "");
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoDocumento: value as 'CPF' | 'CNPJ' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== confirmarSenha) {
      showErrorToast("As senhas não coincidem");
      return;
    }

    const cleanedData = {
      ...formData,
      documento: limparMascara(formData.documento),
      telefone: limparMascara(formData.telefone),
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
        showErrorToast(data.message || "Erro ao realizar cadastro");
        return;
      }
      
      onSucess?.();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro:", error.message);
        showErrorToast(error.message);
      } else {
        console.error("Erro desconhecido:", error);
        showErrorToast("Erro de conexão. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Cadastro de Cliente">
      <form onSubmit={handleSubmit} className="form-cadastro-cliente">
        <InputCustom 
          label="Nome" 
          name="nome" 
          type="text" 
          value={formData.nome} 
          onChange={handleFormChange} 
          required 
     
          placeholder="Nome completo" 
        />
        

        <div className="form-select">
        <label htmlFor="tipoDocumento">Tipo de Documento:</label>
        <SelectCustom 
          options={[
            { label: "CPF", value: "CPF" },
            { label: "CNPJ", value: "CNPJ" }
          ]}
          value={formData.tipoDocumento}
          onChange={handleSelectChange}
        />
        </div>

        <InputCustom 
          label={formData.tipoDocumento === 'CPF' ? 'CPF' : 'CNPJ'} 
          name="documento" 
          type="text" 
          mask={formData.tipoDocumento === 'CPF' ? 'cpf' : 'cnpj'} 
          placeholder={formData.tipoDocumento === 'CPF' ? "000.000.000-00" : "00.000.000/0000-00"} 
          value={formData.documento} 
          onChange={handleFormChange} 
          required 
          
        />
        
        <InputCustom 
          label="Telefone" 
          name="telefone" 
          type="text" 
          mask="phone" 
          value={formData.telefone} 
          onChange={handleFormChange} 
          required 
       
          placeholder="(00) 00000-0000" 
        />
        
        <InputCustom 
          label="Email" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleFormChange} 
          required 

          placeholder="Digite o e-mail" 
        />
        
        <InputCustom 
          label="Endereço" 
          name="endereco" 
          type="text" 
          value={formData.endereco} 
          onChange={handleFormChange} 
          required 
 
          placeholder="Digite o endereço do cliente" 
        />
        
        <InputCustom 
          label="Senha" 
          name="senha" 
          type="password" 
          value={formData.senha} 
          onChange={handleFormChange} 
          required 
      
          placeholder="Digite a senha" 
        />
        
        <InputCustom 
          label="Confirmar Senha" 
          name="confirmarSenha" 
          type="password" 
          value={confirmarSenha} 
          onChange={(e) => setConfirmarSenha(e.target.value)} 
          required 
          placeholder="Confirme a senha" 
        />

        

        <div className="form-buttons">
          <button type="button" onClick={onClose}>Cancelar</button>
          <Button 
            text={isSubmitting ? "Cadastrando..." : "Cadastrar"} 
            disabled={isSubmitting} 
            secondary 
            type="submit" 
          />
        </div>
      </form>
    </Modal>
  );
}