import { useCallback, useEffect, useState } from "react";
import "./ItensDoChecklist.css";
import {
  Pencil,
  PlusCircle,
  EyeOff,
  Eye,
  Box,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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
import { buildApiUrl } from "../../config/api";


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
      const url = new URL(buildApiUrl("/itens"));
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
  }, [buscarItens]);


  const handleToggleSituacao = async (selectedItem: tItem) => {
    try {
      if (selectedItem.situacao === "ATIVO") {
        setModalDesativarItem(true);
        setItemSelecionado(selectedItem);
        return;
      }

      const response = await fetch(buildApiUrl(`/itens/${selectedItem.id}/ativar`), {
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
      <section className="itens-checklist-header-card">
        <div className="itens-checklist-title-row">
          <div className="itens-checklist-title">
            <span className="dashboard-page__eyebrow">Gerenciar itens</span>
            <h1>Itens do Checklist</h1>
            <p>Organize os itens usados nas etapas de inspeção dos veículos.</p>
          </div>

          <div className="itens-checklist-header-action">
            <Button
              text="Cadastrar item"
              icon={<PlusCircle />}
              iconPosition="left"
              secondary
              onClick={() => setModalOpen(true)}
            />
          </div>
        </div>

        <section className="itens-checklist-header">
          <div className="itens-checklist-control-group">
            <span className="itens-checklist-control-label">
              <SlidersHorizontal size={15} aria-hidden="true" />
              Filtros
            </span>

            <div className="itens-checklist-filters">
              <div className="itens-checklist-filter-field">
                <SelectCustom
                  label="Categoria"
                  ariaLabel="Filtrar por categoria"
                  options={categorias}
                  value={filtroCategoria}
                  onChange={setFiltroCategoria}
                />
              </div>

              <div className="itens-checklist-filter-field">
                <SelectCustom
                  label="Situação"
                  ariaLabel="Filtrar por situação"
                  options={situacoes}
                  value={filtroSituacao}
                  onChange={setFiltroSituacao}
                />
              </div>
            </div>
          </div>

          <div className="itens-checklist-control-group itens-checklist-search-group">
            <label
              className="itens-checklist-control-label"
              htmlFor="itens-checklist-search"
            >
              <Search size={15} aria-hidden="true" />
              Pesquisar
            </label>

            <div className="itens-checklist-search-control">
              <Search
                size={18}
                className="itens-checklist-search-icon"
                aria-hidden="true"
              />
              <input
                id="itens-checklist-search"
                type="text"
                placeholder="Buscar item por nome"
                value={buscarTexto}
                onChange={(e) => setBuscarTexto(e.target.value)}
                className="itens-checklist-search"
              />
            </div>
          </div>
        </section>
      </section>

      <div className="itens-checklist-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome do Item</th>
              <th className="coluna-imagem">Imagem ilustrativa</th>
              <th>Parte do Veículo</th>
              <th className="coluna-acoes">Ações</th>
              <th className="coluna-produtos">Gerenciar produtos</th>
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
                  <td className="coluna-imagem">
                    <img
                      className="item-imagem"
                      src={item.imagemIlustrativa}
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
                      className="btn-editar-item"
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
                      className="btn-toggle-situacao"
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
                      {item.situacao === "ATIVO" ? <EyeOff /> : <Eye className="icon-ativar" />}
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
          onClose={() => {
            setModalProdutosDoItem(false);
            buscarItens();
          }}
        />)}




    </div>
  );
}
