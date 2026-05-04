import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { tItem } from "../../types/Item";
import { tProduto } from "../../types/Produtos";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import Modal from "../../layouts/Modal/Modal";
import Loading from "../Loading/Loading";
import { Pencil, Eye, EyeOff } from "lucide-react";
import "./ModalProdutosDoItem.css";
import Button from "../Button/Button";
import { ModalCadastrarProduto } from "../ModalCadastrarProduto/ModalCadastrarProduto";
import { ModalEditarProduto } from "../ModalEditarProduto/ModalEditarProduto";
import ModalDeletarProduto from "../ModalDeletarProduto/ModalDeletarProduto";
import { buildApiUrl } from "../../config/api";

interface ModalProdutosDoItemProps {
    item: tItem | undefined;
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalProdutosDoItem({ item, isOpen, onClose }: ModalProdutosDoItemProps) {
    const { token } = useAuth();
    const [produtos, setProdutos] = useState<tProduto[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalCadastrarProdutoOpen, setModalCadastrarProduto] = useState(false);
    const [modalEditarProdutoOpen, setModalEditarProduto] = useState(false);
    const [modalDeletarProdutoOpen, setModalDeletarProduto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<tProduto | null>(null);


    const buscarProdutosDoItem = useCallback( async () => {
        if (!item?.id) return;

        try {
            setLoading(true);
            const response = await fetch(buildApiUrl(`/itens/${item.id}/produtos`), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do item');
            }
            const data = await response.json();
            setProdutos(data.data);
        } catch (error) {
            console.error('Erro ao buscar produtos do item:', error);
            const message = error instanceof Error ? error.message : 'Erro ao buscar produtos do item';
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    }, [item?.id, token]);

    const handleToggleSituacaoProduto = useCallback(
        async (produto: tProduto) => {
            if (!item?.id) return;

            try {
                if (produto.situacao === "ATIVO") {
                    setProdutoSelecionado(produto);
                    setModalDeletarProduto(true);
                    return;
                }

                const response = await fetch(
                    buildApiUrl(`/itens/${item.id}/produtos/${produto.produtoId}/ativar`),
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Erro ao ativar produto");
                }

                showSuccessToast("Produto ativado com sucesso");
                buscarProdutosDoItem();
            } catch (error) {
                console.error("Erro ao alterar situação do produto:", error);
                const message =
                    error instanceof Error
                        ? error.message
                        : "Erro ao alterar situação do produto";
                showErrorToast(message);
            }
        },
        [item?.id, token, buscarProdutosDoItem]
    );

     useEffect(() => {
    if (isOpen && item) {
      buscarProdutosDoItem();
    }
  }, [isOpen, item, buscarProdutosDoItem]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} header={` ${item?.nome}`} >
           <div className="produtos-table">
                <div className="table-header">
                    <Button secondary text="Cadastrar Produto" onClick={() => {
                        setModalCadastrarProduto(true);
                    }} />
                </div>
                <table>
                    <thead>
                        <tr>
                            
                            <th>Nome do Produto</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={2}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : produtos.length > 0 ? (
                            produtos.map((produto) => (
                                <tr
                                    key={produto.id}
                                    className={produto.situacao === "INATIVO" ? "produto-inativo" : ""}
                                >
                                    <td>{produto.nomeProduto}</td>
                                    <td className="acoes-coluna">
                                      <div className="acoes">
                                        <button
                                            id="editar"
                                            aria-label={`Editar produto ${produto.nomeProduto}`}
                                            title={`Editar produto`}
                                            onClick={() => {
                                               setProdutoSelecionado(produto);
                                               setModalEditarProduto(true);
                                            }}
                                            disabled={produto.situacao === "INATIVO"}
                                        >
                                            <Pencil />
                                        </button>

                                        <button
                                            id={produto.situacao === "ATIVO" ? "desativar-produto" : "ativar-produto"}
                                            aria-label={
                                                produto.situacao === "ATIVO"
                                                    ? `Desativar produto ${produto.nomeProduto}`
                                                    : `Ativar produto ${produto.nomeProduto}`
                                            }
                                            title={
                                                produto.situacao === "ATIVO"
                                                    ? "Desativar produto"
                                                    : "Ativar produto"
                                            }
                                            onClick={() => handleToggleSituacaoProduto(produto)}
                                        >
                                            {produto.situacao === "ATIVO" ? <EyeOff /> : <Eye />}
                                        </button>
                                      </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2}>Não há produtos associados a este item.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {modalCadastrarProdutoOpen && (
                <ModalCadastrarProduto
                    isOpen={modalCadastrarProdutoOpen}
                    onClose={() => {
                        setModalCadastrarProduto(false);
                    }}
                    itemId={item?.id}
                        onSuccess={buscarProdutosDoItem}
                />
            )}
                {modalEditarProdutoOpen && (
                    <ModalEditarProduto
                        isOpen={modalEditarProdutoOpen}
                        onClose={() => {
                            setModalEditarProduto(false);
                            setProdutoSelecionado(null);
                        }}
                        produto={produtoSelecionado}
                        itemId={item?.id}
                        onSuccess={buscarProdutosDoItem}
                    />
                )}
                {modalDeletarProdutoOpen && (
                    <ModalDeletarProduto
                        isOpen={modalDeletarProdutoOpen}
                        onClose={() => {
                            setModalDeletarProduto(false);
                            setProdutoSelecionado(null);
                        }}
                        produto={produtoSelecionado}
                        itemId={item?.id}
                        onSuccess={buscarProdutosDoItem}
                    />
                )}
        </Modal>
    );
}