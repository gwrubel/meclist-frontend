import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { tItem } from "../../types/Item";
import { tProduto } from "../../types/Produtos";
import { showErrorToast } from "../../utils/toast";
import Modal from "../../layouts/Modal/Modal";
import Loading from "../Loading/Loading";
import { Pencil, Trash } from "lucide-react";
import "./ModalProdutosDoItem.css";
import Button from "../Button/Button";
import { ModalCadastrarProduto } from "../ModalCadastrarProduto/ModalCadastrarProduto";
import { ModalEditarProduto } from "../ModalEditarProduto/ModalEditarProduto";
import ModalDeletarProduto from "../ModalDeletarProduto/ModalDeletarProduto";

interface ModalProdutosDoItemProps {
    item: tItem | undefined;
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalProdutosDoItem({ item, isOpen, onClose }: ModalProdutosDoItemProps) {
    const token = useAuth();
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
            const response = await fetch(`http://localhost:8080/itens/${item.id}/produtos`, {
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
                                <tr key={produto.id}>
                                    
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
                                        >
                                            <Pencil />
                                        </button>

                                        <button
                                            id="desativar"
                                            aria-label={`Desativar produto ${produto.nomeProduto}`}
                                            title={`Desativar produto`}
                                            onClick={() => {
                                                   setProdutoSelecionado(produto);
                                                   setModalDeletarProduto(true);
                                            }}
                                        >
                                            <Trash />
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