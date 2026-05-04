import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import Modal from "../../layouts/Modal/Modal";
import Button from "../Button/Button";
import { tProduto } from "../../types/Produtos";
import "./ModalDeletarProduto.css";
import { buildApiUrl } from "../../config/api";

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
        if (!itemId || !produto?.produtoId) return;

        try {
            setIsDeleting(true);
            const response = await fetch(
                buildApiUrl(`/itens/${itemId}/produtos/${produto.produtoId}/desativar`),
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Erro ao desativar o produto");
            }

            showSuccessToast("Produto desativado com sucesso");
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Erro ao desativar o produto:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao desativar o produto";
            showErrorToast(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} header="Confirmar Desativação">
            <div>
                <p style={{ fontWeight: 'bold', padding: '2rem' }}>
                    Tem certeza que deseja desativar o produto "{produto?.nomeProduto}"?
                </p>
                <div className="desativar-produto-buttons">
                    <button id="cancelar" onClick={onClose} disabled={isDeleting}>Cancelar</button>
                    <Button
                        text={isDeleting ? "Desativando..." : "Confirmar"}
                        onClick={handleDelete}
                        disabled={isDeleting}
                        secondary
                    />
                </div>
            </div>
        </Modal>
    );
}
