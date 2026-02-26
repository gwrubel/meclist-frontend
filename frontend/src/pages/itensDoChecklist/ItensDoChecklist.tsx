import { useCallback, useEffect, useState } from "react";
import "./ItensDoChecklist.css";
import { Pencil, PlusCircle, EyeOff, Eye, Box } from "lucide-react";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import ModalCadastroItem from "../../components/ModalCadastroItem/ModalCadastroItem";
import { useAuth } from "../../contexts/AuthContext";
import { tItem } from "../../types/Item"
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import Loading from "../../components/Loading/Loading";
import ModalEditarItem from "../../components/ModalEditarItem/ModalEditarItem";
import ModalProdutosDoItem from "../../components/ModalProdutosDoItem/ModalProdutosDoItem";
import ModalDesativarItem from "../../components/ModalDeletarItem/ModalDesativarItem";


export default function ItensDoChecklist() {
  const { token } = useAuth();
  const [item, setItens] = useState<tItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [buscarTexto, setBuscarTexto] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDesativarItem, setModalDesativarItem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemSelecionado, setItemSelecionado] = useState<tItem | undefined>(undefined);
  const [modalEditarItem, setModalEditarItem] = useState(false);
  const [modalProdutosDoItem, setModalProdutosDoItem] = useState(false);
  const URL_BASE_IMAGEM = "http://localhost:8080";

  // NOVO: filtro de situação
  const [filtroSituacao, setFiltroSituacao] = useState<string>("ATIVO");

  const categorias = [
    { label: "Todos", value: "Todos" },
    { label: "Dentro do Veículo", value: "DENTRO_DO_VEICULO" },
    { label: "Fora do Veículo", value: "FORA_DO_VEICULO" },
    { label: "Veículo no Chão", value: "VEICULO_NO_CHAO" },
    { label: "Veículo no Elevador", value: "VEICULO_NO_ELEVADOR" },
    { label: "Capô Levantado", value: "CAPO_LEVANTADO" },
  ];

  // NOVO: opções de situação
  const situacoes = [
    { label: "Ativos", value: "ATIVO" },
    { label: "Inativos", value: "INATIVO" },
  ];

  const buscarItens = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("http://localhost:8080/itens");
      if (filtroCategoria !== "Todos") {
        url.searchParams.append("categoria", filtroCategoria);
      }
      // NOVO: sempre envia situacao (ATIVO ou INATIVO)
      url.searchParams.append("situacao", filtroSituacao);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar itens do checklist");
      }
      const data = await response.json();
      setItens(data.data);

    } catch (error) {
      console.error("Erro ao buscar partes:", error);
      const message = error instanceof Error ? error.message : "Erro ao buscar partes";
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }, [filtroCategoria, filtroSituacao, token]);

  useEffect(() => {
    buscarItens();
  }, [filtroCategoria, filtroSituacao, buscarItens]);


  const handleToggleSituacao = async (selectedItem: tItem) => {
    try {
      if (selectedItem.situacao === "ATIVO") {
        setModalDesativarItem(true);
        setItemSelecionado(selectedItem);
        return;
      }

      const response = await fetch(`http://localhost:8080/itens/${selectedItem.id}/ativar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao ativar item");
      }

      showSuccessToast("Item ativado com sucesso");
      buscarItens();
    } catch (error) {
      console.error("Erro ao alterar situação do item:", error);
      const message =
        error instanceof Error ? error.message : "Erro ao alterar situação do item";
      showErrorToast(message);
    }
  };


  const partesFiltradas = item.filter((item) =>
    item.nome.toLowerCase().includes(buscarTexto.toLowerCase())
  );

  return (
    <div className="itens-checklist-container">
      <h1>Itens do Checklist</h1>

      <section className="itens-checklist-header">
        <div>
          <SelectCustom
            options={categorias}
            value={filtroCategoria}
            onChange={setFiltroCategoria}
          />
        </div>

        
        <div>
          <SelectCustom
            options={situacoes}
            value={filtroSituacao}
            onChange={setFiltroSituacao}
          />
        </div>

        <div className="itens-checklist-actions">
          <Button
            text="Cadastrar Item"
            icon={<PlusCircle />}
            iconPosition="left"
            secondary
            onClick={() => setModalOpen(true)}
          />
          <input
            type="text"
            placeholder="Buscar por nome"
            value={buscarTexto}
            onChange={(e) => setBuscarTexto(e.target.value)}
            className="search-input"
          />
        </div>
      </section>

      <div className="parte-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Item</th>
              <th>Imagem ilustrativa</th>
              <th>Parte do Veículo</th>
              <th>Ações</th>
              <th>Gerenciar produtos</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <Loading />
                </td>
              </tr>
            ) : partesFiltradas.length > 0 ? (
              partesFiltradas.map((item) => (
                <tr
                  key={item.id}
                  className={item.situacao === "INATIVO" ? "item-inativo" : ""}
                >
                  <td>N°{String(item.id).padStart(3, "0")}</td>
                  <td>{item.nome}</td>
                  <td>
                    <img
                      className="item-imagem"
                      src={`${URL_BASE_IMAGEM}${item.imagemIlustrativa}`}
                      alt={item.nome}
                    />
                  </td>
                  <td>
                    {item.parteDoVeiculo
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </td>
                  <td className="acoes-coluna">
                    <div className="acoes">
                    <button
                      id="editar"
                      aria-label={`Editar item`}
                      title={`Editar item`}
                      onClick={() => {
                        setModalEditarItem(true);
                        setItemSelecionado(item);
                      }}
                      disabled={item.situacao === "INATIVO"}
                    >
                      <Pencil />
                    </button>

                    <button
                      id="desativar"
                      onClick={() => handleToggleSituacao(item)}
                      aria-label={
                        item.situacao === "ATIVO"
                          ? `Desativar item`
                          : `Ativar item`
                      }
                      title={
                        item.situacao === "ATIVO"
                          ? `Desativar item`
                          : `Ativar item`
                      }
                    >
                      {item.situacao === "ATIVO" ? <EyeOff /> : <Eye id="ativar" />}
                    </button>
                    </div>
                  </td>
                  {/* COLUNA DE GERENCIAR PRODUTOS */}
                  <td className="coluna-gerenciar-produtos">
                    <button
                      className="btn-produtos"
                      onClick={() => {
                        setModalProdutosDoItem(true);
                        setItemSelecionado(item);
                      }}
                      disabled={item.situacao === "INATIVO"}
                      
                    >
                      <span className="btn-produtos-text">
                        Produtos ({item.quantidadeProdutos})
                      </span>
                      <Box className="btn-produtos-icon" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Nenhum item encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ModalCadastroItem
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            buscarItens();
            setModalOpen(false);
          }}
        />
      )}

      {modalDesativarItem && (
        <ModalDesativarItem
          isOpen={modalDesativarItem}
          item={itemSelecionado}
          onClose={() => setModalDesativarItem(false)}
          onSuccess={() => {
            buscarItens();
            setModalDesativarItem(false);
            setItemSelecionado(undefined);
          }}
        />
      )}

      {modalEditarItem && (
        <ModalEditarItem
          isOpen={modalEditarItem}
          item={itemSelecionado}
          onClose={() => { setModalEditarItem(false); buscarItens(); }}
          onSuccess={() => {
            buscarItens();
            setModalEditarItem(false);
            setItemSelecionado(undefined);
          }}
        />)}

      {modalProdutosDoItem && (
        <ModalProdutosDoItem
          isOpen={modalProdutosDoItem}
          item={itemSelecionado}
          onClose={() => { { setModalProdutosDoItem(false); buscarItens(); }
        }
      }
        />)}




    </div>
  );
}
