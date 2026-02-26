import { useState, useEffect } from "react";
import Modal from "../../layouts/Modal/Modal";
import InputCustom from "../InputCustom/InputCustom";
import Button from "../Button/Button";
import { tProduto, tProdutoCadastro } from "../../types/Produtos";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useAuth } from "../../contexts/AuthContext";
import "./ModalEditarProduto.css";

interface ModalEditarProdutoProps {
    isOpen: boolean;
    onClose: () => void;
    produto: tProduto | null;
    itemId: number | undefined;
    onSuccess?: () => void;
}

export function ModalEditarProduto({ isOpen, onClose, produto, itemId, onSuccess }: ModalEditarProdutoProps) {
    const [formData, setFormData] = useState<tProdutoCadastro>({
        nomeProduto: '',
    });
    const { token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && produto) {
            setFormData({
                nomeProduto: produto.nomeProduto || '',
            });
        }
    }, [isOpen, produto]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:8080/itens/${itemId}/produtos/${produto?.produtoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (!response.ok) {
                showErrorToast(data.message || "Erro ao atualizar produto.");
                return;
            }

            showSuccessToast(data.message || "Produto atualizado com sucesso!");
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
        <Modal isOpen={isOpen} onClose={onClose} header="Editar Produto">
            <form onSubmit={handleSubmit} className="editar-produto-form">
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
                        text={isSubmitting ? "Atualizando..." : "Atualizar"} 
                        secondary 
                        type="submit"  
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Modal>
    );
}
