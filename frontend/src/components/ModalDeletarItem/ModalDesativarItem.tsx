import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import './ModalDesativarItem.css'
import { tItem } from "../../types/Item";

interface ModalDeletarItemProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    item: tItem | undefined;
}

export default function ModalDeletarItem({ isOpen, onClose, onSuccess, item }: ModalDeletarItemProps) {
    const { token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    

  const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`http://localhost:8080/itens/${item?.id}/desativar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Erro ao desativar o item');
            }
            showSuccessToast('Item desativado com sucesso');
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Erro ao desativar o item:', error);
            const message = error instanceof Error ? error.message : 'Erro ao desativar o item';
            showErrorToast(message);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Confirmar Desativação">
            <div>
                <p style={{ fontWeight: 'bold', padding: '2rem' }}>Tem certeza que deseja desativar este item?</p>
                <div className="deletar-item-buttons">
                    <button id="cancelar" onClick={onClose} disabled={isDeleting}>Cancelar</button>
                    <Button text={isDeleting ? "Desativando..." : "Confirmar"} onClick={handleDelete} disabled={isDeleting} secondary/>
                </div>
            </div>
        </Modal>
    );
}