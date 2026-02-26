import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import { tProduto } from "../../types/Produtos";
import "./ModalDeletarProduto.css";

interface ModalDeletarProdutoProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    produto: tProduto | null;
    itemId: number | undefined;
}

export default function ModalDeletarProduto({ isOpen, onClose, onSuccess, produto, itemId }: ModalDeletarProdutoProps) {
    const { token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`http://localhost:8080/itens/${itemId}/produtos/${produto?.idProduto}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao deletar o produto');
            }
            
            showSuccessToast('Produto deletado com sucesso');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Erro ao deletar o produto:', error);
            const message = error instanceof Error ? error.message : 'Erro ao deletar o produto';
            showErrorToast(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Confirmar Exclusão">
            <div>
                <p style={{ fontWeight: 'bold', padding: '2rem' }}>
                    Tem certeza que deseja deletar o produto "{produto?.nomeProduto}"?
                </p>
                <div className="deletar-produto-buttons">
                    <button id="cancelar" onClick={onClose} disabled={isDeleting}>Cancelar</button>
                    <Button 
                        text={isDeleting ? "Deletando..." : "Confirmar"} 
                        onClick={handleDelete} 
                        disabled={isDeleting} 
                        secondary
                    />
                </div>
            </div>
        </Modal>
    );
}
