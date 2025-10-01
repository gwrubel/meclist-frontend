import { useState, useEffect } from "react";
import { tMecanico } from "../../types/Mecanico";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalEditarMecanico.css";
import {  aplicarMascaraCpf, aplicarMascaraTelefone } from "../../utils/maskUtils";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { useAuth } from "../../contexts/AuthContext";
import { SelectCustom } from "../Select/SelectCustom";


interface EditarMecanicoProps {
  isOpen: boolean;
  onClose: () => void;
  mecanico: tMecanico | null; 
  onSucess?: () => void;
}

export default function ModalEditarMecanico({ isOpen, onClose, mecanico, onSucess }: EditarMecanicoProps) {
  const [formData, setFormData] = useState<tMecanico>({
    id: 0,
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    situacao: "ATIVO"
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (mecanico) {
      setFormData(mecanico);
    }
  }, [mecanico]);

  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    let newValue = value;
    if (name === "cpf") newValue = aplicarMascaraCpf(value);
    if (name === "telefone") newValue = aplicarMascaraTelefone(value);
  
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };
  
  function limparMascara(valor: string) {
    return valor.replace(/\D/g, "");
  }
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true)


    const cleanedData = {
      ...formData,
      cpf: limparMascara(formData.cpf),
      telefone: limparMascara(formData.telefone),
    };

    try {
      const response = await fetch(`http://localhost:8080/mecanicos/${cleanedData.id}`, {
        method: 'PUT', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
        body: JSON.stringify(cleanedData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          showErrorToast(data.message || "Erro ao atualizar cadastro");
          setErrors(data.errors);
        } else {
          showErrorToast(data.message || "Erro ao atualizar cadastro");
          setErrors({ geral: data.message || "Erro ao atualizar cadastro" });
        }
        return;
      }

      showSuccessToast(data.message);
      onSucess?.();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro:", error.message);
        setErrors({ geral: error.message });
      } else {
        console.error("Erro desconhecido:", error);
        setErrors({ geral: "Erro de conexão. Tente novamente." });
      }
    }
    finally{
      setIsSubmitting(false);
    }
  };

  if (!mecanico) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Editar Mecânico">
      <form onSubmit={handleSubmit}>
        <InputCustom label="Nome" name="nome" type="text" value={formData.nome} onChange={handleFormChange} required error={errors.nome} placeholder="Nome completo" />
        <InputCustom label="CPF" name="cpf" type="text"  placeholder="000.000.000-00" value={aplicarMascaraCpf(formData.cpf)} onChange={handleFormChange} required error={errors.cpf} />
        <InputCustom label="Telefone" name="telefone" type="text"  value={aplicarMascaraTelefone(formData.telefone)}  onChange={handleFormChange} required error={errors.telefone} placeholder="(00) 00000-0000" />
        <InputCustom label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required error={errors.email} placeholder="Digite o e-mail" />
        <div className="form-group">
          <label htmlFor="situacao">Situação:</label>
          <SelectCustom
            options={[
              { label: "Ativo", value: "ATIVO" },
              { label: "Inativo", value: "INATIVO" },
            ]}
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
