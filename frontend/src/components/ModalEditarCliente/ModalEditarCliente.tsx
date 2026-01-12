import { useState, useEffect } from "react";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalEditarCliente.css";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useAuth } from "../../contexts/AuthContext";
import { tCliente } from "../../types/Cliente";
import { SelectCustom } from "../Select/SelectCustom";

interface EditarClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: tCliente | null;
  onSucess?: () => void;
}

export default function ModalEditarCliente({ isOpen, onClose, cliente, onSucess }: EditarClienteProps) {
  const [formData, setFormData] = useState<tCliente>({
    id: 0,
    nome: '',
    email: '',
    telefone: '',
    tipoDocumento: 'CPF',
    documento: '',
    endereco: '',
    situacao: 'ATIVO',
    quantidadeVeiculos: 0
  });

  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    }
  }, [cliente]);

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
    setIsSubmitting(true);

    const cleanedData = {
      ...formData,
      documento: limparMascara(formData.documento),
      telefone: limparMascara(formData.telefone),
    };

    try {
      const response = await fetch(`http://localhost:8080/clientes/${cleanedData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        showErrorToast(data.message || "Erro ao atualizar cliente");
        return;
      }

      showSuccessToast(data.message || "Cliente atualizado com sucesso!");
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

  if (!cliente) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Editar Cliente">
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
        <div className="form-select">
          <label htmlFor="situacao">Situação:</label>
        <SelectCustom
          options={[
            { label: "Ativo", value: "ATIVO" }, 
            { label: "Inativo", value: "INATIVO" }
          ]}
          value={formData.situacao}
          onChange={(val) => setFormData((p) => ({ ...p, situacao: val as "ATIVO" | "INATIVO" }))}
        />
</div>
        <div className="form-buttons">
          <button type="button" onClick={onClose}>Cancelar</button>
          <Button 
            text={isSubmitting ? "Salvando..." : "Salvar"} 
            disabled={isSubmitting} 
            secondary 
            type="submit" 
          />
        </div>
      </form>
    </Modal>
  );
}