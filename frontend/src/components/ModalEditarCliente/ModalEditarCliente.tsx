import { useState, useEffect } from "react";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalEditarCliente.css";
import { aplicarMascaraCpf, aplicarMascaraTelefone } from "../../utils/maskUtils";
import { showSuccessToast } from "../../utils/toast";
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
    cpf: '',
    endereco: '',
    situacao: "ATIVO",
    veiculos: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    }
  }, [cliente]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "cpf") newValue = aplicarMascaraCpf(value);
    if (name === "telefone") newValue = aplicarMascaraTelefone(value);

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const limparMascara = (valor: string) => valor.replace(/\D/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanedData = {
      ...formData,
      cpf: limparMascara(formData.cpf),
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
        setErrors(data.errors || { geral: data.message || "Erro ao atualizar cliente" });
        return;
      }

      showSuccessToast(data.message);
      onSucess?.();
    } catch (error) {
      setErrors({ geral: error instanceof Error ? error.message : "Erro de conexão. Tente novamente." });
    }
    finally{
      setIsSubmitting(false);
    }

    
  };

  if (!cliente) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Editar Cliente">
      <form onSubmit={handleSubmit}>
        <InputCustom label="Nome" name="nome" type="text" value={formData.nome} onChange={handleFormChange} required error={errors.nome} placeholder="Nome completo" />
        <InputCustom label="CPF" name="cpf" type="text" placeholder="000.000.000-00" value={aplicarMascaraCpf(formData.cpf)} onChange={handleFormChange} required error={errors.cpf} />
        <InputCustom label="Telefone" name="telefone" type="text" placeholder="(00) 00000-0000" value={aplicarMascaraTelefone(formData.telefone)} onChange={handleFormChange} required error={errors.telefone} />
        <InputCustom label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required error={errors.email} placeholder="Digite o e-mail" />
        <InputCustom label="Endereço" name="endereco" type="text" value={formData.endereco} onChange={handleFormChange} required error={errors.endereco} placeholder="Endereço completo" />

        <div id="select-situacao">
          <label htmlFor="situacao">Situação:</label>
          <SelectCustom
            options={[{ label: "Ativo", value: "ATIVO" }, { label: "Inativo", value: "INATIVO" }]}
            value={formData.situacao}
            onChange={(val) => setFormData((p) => ({ ...p, situacao: val as "ATIVO" | "INATIVO" }))}
            ariaLabel="Selecionar situação"
          />
        </div>

       

        <div className="form-buttons">
          <button type="button" onClick={onClose}>Cancelar</button>
          <Button text={isSubmitting ? "Salvando..." : "Salvar"} disabled={isSubmitting} secondary type="submit" />
        </div>
      </form>
    </Modal>
  );
}
