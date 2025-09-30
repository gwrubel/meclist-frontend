import { useState, useEffect } from "react";
import InputCustom from "../InputCustom/InputCustom";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import "./ModalEditarVeiculo.css";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useAuth } from "../../contexts/AuthContext";
import { tVeiculo } from "../../types/Veiculo";
import { tCliente } from "../../types/Cliente";

interface EditarVeiculoProps {
    cliente: tCliente | null;
    isOpen: boolean;
    onClose: () => void;
    veiculo: tVeiculo | null;
    onSucess?: () => void;
}
export default function ModalEditarVeiculo({ cliente, isOpen, onClose, veiculo, onSucess }: EditarVeiculoProps) {
    const [formData, setFormData] = useState<tVeiculo>({
        id: 0,
        placa: '',
        modelo: '',
        marca: '',
        cor: '',
        ano: 0,
        quilometragem: 0,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (veiculo) {
            setFormData(veiculo);
        }
    }, [veiculo]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "quilometragem" || name === "ano" ? Number(value) : value, 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const currentYear = new Date().getFullYear();
        const ano = Number(formData.ano);
        const quilometragem = Number(formData.quilometragem);

        const newErrors: { [key: string]: string } = {};

        const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
        if (!placaRegex.test(formData.placa.toUpperCase())) {
            newErrors.placa = "Placa inválida (ex: ABC1234 ou ABC1D23)";
            showErrorToast("Placa inválida");
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
            setIsSubmitting(false);
            return;
        }

        const cleanedData = {
            ...formData,
            ano,
            quilometragem,
        };

        try {
            const id = cliente?.id;
            const response = await fetch(`http://localhost:8080/clientes/${id}/veiculos/${formData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.errors || { geral: data.message || "Erro ao atualizar veículo" });
                showErrorToast(data.message || "Erro ao atualizar veículo");
                return;
            }

            showSuccessToast(data.message);
            onSucess?.();
        } catch (error) {
            setErrors({ geral: error instanceof Error ? error.message : "Erro de conexão. Tente novamente." });
            showErrorToast(error instanceof Error ? error.message : "Erro de conexão.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!veiculo) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Editar Veículo">
            <form onSubmit={handleSubmit}>
                <InputCustom label="Placa" name="placa" type="text" value={formData.placa} onChange={handleFormChange} required error={errors.placa} placeholder="Digite a placa" />
                <InputCustom label="Modelo" name="modelo" type="text" value={formData.modelo} onChange={handleFormChange} required error={errors.modelo} placeholder="Digite o modelo" />
                <InputCustom label="Marca" name="marca" type="text" value={formData.marca} onChange={handleFormChange} required error={errors.marca} placeholder="Digite a marca" />
                <InputCustom label="Cor" name="cor" type="text" value={formData.cor} onChange={handleFormChange} required error={errors.cor} placeholder="Digite a cor" />
                <InputCustom label="Ano" name="ano" type="text" value={String(formData.ano)} onChange={handleFormChange} required error={errors.ano} placeholder="Digite o ano" />
                <InputCustom label="Quilometragem" name="quilometragem" type="number" value={String(formData.quilometragem)} onChange={handleFormChange} required error={errors.quilometragem} placeholder="Digite a quilometragem" />


                <div className="form-buttons">
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <Button text={isSubmitting ? "Salvando..." : "Salvar"} disabled={isSubmitting} secondary type="submit" />
                </div>
            </form>
        </Modal>
    );
}