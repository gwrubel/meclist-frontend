import { useEffect, useState } from "react";
import "./ParteDoChecklist.css";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import ModalCadastroItem from "../../components/ModalCadastroParte/ModalCadastroItem";
import { useAuth } from "../../contexts/AuthContext";
import { tItem } from "../../types/Item"
import { showErrorToast, showSuccessToast } from "../../utils/toast";


export default function CadastroParteChecklist() {
  const { token } = useAuth();
  const [item, setItens] = useState<tItem[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [buscarTexto, setBuscarTexto] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const URL_BASE_IMAGEM = "http://localhost:8080";


  const categorias = [
    { label: "Todos", value: "Todos" },
    { label: "Dentro do Veículo", value: "DENTRO_DO_VEICULO" },
    { label: "Fora do Veículo", value: "FORA_DO_VEICULO" },
  ];

  const buscarPartes = async () => {
    try {
      const url = new URL("http://localhost:8080/itens");
      if (filtroCategoria !== "Todos") {
        url.searchParams.append("categoria", filtroCategoria);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar itens do checklist");
      }
      const data = await response.json();
      setItens(data);
      console.log(data);
    } catch (error) {
      console.error("Erro ao buscar partes:", error);
      const message = error instanceof Error ? error.message : "Erro ao buscar partes";
      showErrorToast(message);
    }
  };

  useEffect(() => {
    buscarPartes();
  }, [filtroCategoria]);

  const partesFiltradas = item.filter((item) =>
    item.nome.toLowerCase().includes(buscarTexto.toLowerCase())
  );

  return (
    <div className="parte-checklist-container">
      <h1>Cadastro de Partes do Checklist</h1>

      <section className="parte-checklist-header">
        <SelectCustom
          options={categorias}
          value={filtroCategoria}
          onChange={setFiltroCategoria}
        />

        <div className="parte-checklist-actions">
          <Button
            text="Cadastrar Item"
            icon={<PlusCircle />}
            iconPosition="left"
            secondary
            onClick={() => setModalOpen(true)}
          />
          <input
            type="text"
            placeholder="Buscar parte"
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
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {partesFiltradas.map((item) => (
              <tr key={item.id}>
                <td>N°{String(item.id).padStart(3, "0")}</td>
                <td>
                  <img
                    src={`${URL_BASE_IMAGEM}${item.imagemIlustrativa}`}
                    alt={item.nome}
                    style={{ width: "100px", height: "auto", objectFit: "contain" }}
                  />
                </td>
                <td>{item.nome}</td>
                <td>
                  {item.parteDoVeiculo
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </td>
                <td className="acoes">
                  <button id="editar" aria-label={`Editar item ${item.nome}`}>Editar <Pencil/></button>
                  <button id="deletar" aria-label={`Excluir item ${item.nome}`}>Excluir <Trash /></button>
                </td>
              </tr>
              
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ModalCadastroItem
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            buscarPartes();
            setModalOpen(false);
            showSuccessToast("Item cadastrado com sucesso.");
          }}
        />
      )}
    </div>
  );
}
