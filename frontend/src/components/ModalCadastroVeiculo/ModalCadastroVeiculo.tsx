import { useState } from "react";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import { useAuth } from "../../contexts/AuthContext";
import { tVeiculoCadastro } from "../../types/Veiculo";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

interface CadastroDeVeiculoProps {
  isOpen: boolean;
  onClose: () => void;
  onSucess?: () => void;
  clienteId?: number | null; 
}

export default function ModalCadastroVeiculo({ isOpen, onClose, onSucess, clienteId }: CadastroDeVeiculoProps) {
  const [formData, setFormData] = useState<tVeiculoCadastro>({
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
    quilometragem: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const currentYear = new Date().getFullYear();
    const ano = Number(formData.ano);
    const quilometragem = Number(formData.quilometragem);
  
    const newErrors: { [key: string]: string } = {};
  
    // Validação da placa (padrão antigo e novo)
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
    if (!placaRegex.test(formData.placa.toUpperCase())) {
      newErrors.placa = "Placa inválida (ex: ABC1234 ou ABC1D23)";
      showErrorToast("Placa inválida!");
    }
  
    if (!formData.marca.trim()) {
      newErrors.marca = "Marca obrigatória";
    }
  
    if (!formData.modelo.trim()) {
      newErrors.modelo = "Modelo obrigatório";
    }
  
    if (!formData.cor.trim()) {
      newErrors.cor = "Cor obrigatória";
    }
  
    if (isNaN(ano) || ano <= 0 || ano.toString().length !== 4) {
      newErrors.ano = "Ano inválido";
      showErrorToast("Ano inválido");
    } else if (ano > currentYear) {
      newErrors.ano = `Ano não pode ser maior que ${currentYear}`;
      showErrorToast(`Ano não pode ser maior que ${currentYear}`);
    }
  
    if (isNaN(quilometragem) || quilometragem < 0) {
      newErrors.quilometragem = "Quilometragem inválida";
      showErrorToast("Quilometragem inválida");
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false); // <- Aqui você garante que o botão volte ao normal
      return;
    }
  
    const cleanedData = {
      ...formData,
      ano,
      quilometragem,
    };
  
    try {
      const response = await fetch(`http://localhost:8080/clientes/${clienteId}/veiculos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        showErrorToast(data.message || "Erro ao cadastrar veículo");
        setErrors(data.errors || { geral: data.message || "Erro ao cadastrar veículo" });
        return;
      }
  
      showSuccessToast(data.message);
      onSucess?.();
    } catch (error) {
      setErrors({ geral: error instanceof Error ? error.message : "Erro de conexão. Tente novamente." });
      showErrorToast(error instanceof Error ? error.message : "Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} header="Cadastro de Veículo">
      <form onSubmit={handleSubmit}>
        <InputCustom label="Placa" name="placa" type="text" value={formData.placa} onChange={handleFormChange} required error={errors.placa} placeholder="Digite a placa do veículo" />
        <InputCustom label="Marca" name="marca" type="text" value={formData.marca} onChange={handleFormChange} required error={errors.marca} placeholder="Digite a marca do veículo" />
        <InputCustom label="Modelo" name="modelo" type="text" value={formData.modelo} onChange={handleFormChange} required error={errors.modelo} placeholder="Digite o modelo do veículo" />
        <InputCustom label="Ano" name="ano" type="number" value={formData.ano} onChange={handleFormChange} required error={errors.ano} placeholder="Digite o ano do veículo" />
        <InputCustom label="Cor" name="cor" type="text" value={formData.cor} onChange={handleFormChange} required error={errors.cor} placeholder="Digite a cor do veículo" />
        <InputCustom label="Quilometragem" name="quilometragem" type="number" value={formData.quilometragem} onChange={handleFormChange} required error={errors.quilometragem} placeholder="Digite a quilometragem do veículo" />

      

        <div className="form-buttons">
          <button type="button" onClick={onClose}>Cancelar</button>
          <Button text={isSubmitting ? "Cadastrando..." : "Cadastrar"} secondary type="submit" disabled = {isSubmitting} />
        </div>
      </form>
    </Modal>
  );
}
