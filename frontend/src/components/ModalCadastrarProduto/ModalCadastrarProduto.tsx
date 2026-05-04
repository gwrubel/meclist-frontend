import { useState } from "react";
import Modal from "../../layouts/Modal/Modal";
import InputCustom from "../InputCustom/InputCustom";
import Button from "../Button/Button";
import { tProdutoCadastro } from "../../types/Produtos";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useAuth } from "../../contexts/AuthContext";
import "./ModalCadastrarProduto.css";
import { buildApiUrl } from "../../config/api";

interface ModalCadastrarProdutoProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: number | undefined;
    onSuccess?: () => void;
}

export function ModalCadastrarProduto({ isOpen, onClose, itemId, onSuccess }: ModalCadastrarProdutoProps) {
    const [formData, setFormData] = useState<tProdutoCadastro>({
        nomeProduto: '',
    });
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(buildApiUrl(`/itens/${itemId}/produtos`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (!response.ok) {
                showErrorToast(data.message || "Erro ao cadastrar produto.");
                return;
            }

            showSuccessToast(data.message || "Produto cadastrado com sucesso!");
            setFormData({ nomeProduto: '' });
            onSuccess?.();
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
        <Modal isOpen={isOpen} onClose={onClose} header="Cadastrar Produto">
            <form onSubmit={handleSubmit} className="cadastro-produto-form">
                <InputCustom 
                    label="Nome do Produto" 
                    name="nomeProduto" 
                    type="text" 
                    value={formData.nomeProduto} 
                    onChange={handleFormChange} 
                    required 
                    placeholder="Digite o nome do produto" 
                />

                <div className="form-buttons">
                    <button type="button" onClick={onClose}>Cancelar</button>
                    <Button 
                        text={isSubmitting ? "Cadastrando..." : "Cadastrar"} 
                        secondary 
                        type="submit"  
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Modal>
    );
}