import { useEffect, useState } from "react";
import "./ParteDoChecklist.css";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import Button from "../../components/Button/Button";
import { SelectCustom } from "../../components/Select/SelectCustom";
import ModalCadastroParte from "../../components/ModalCadastroParte/ModalCadastroParte";
import { useAuth } from "../../contexts/AuthContext";
import { tParteVeiculo } from "../../types/ParteVeiculo"


export default function CadastroParteChecklist() {
  const { token } = useAuth();
  const [partes, setPartes] = useState<tParteVeiculo[]>([]);
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
      const url = new URL(" http://localhost:8080/parte-veiculo");
      if (filtroCategoria !== "Todos") {
        url.searchParams.append("categoria", filtroCategoria);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPartes(data);
    } catch (error) {
      console.error("Erro ao buscar partes:", error);
    }
  };

  useEffect(() => {
    buscarPartes();
  }, [filtroCategoria]);

  const partesFiltradas = partes.filter((parte) =>
    parte.nome.toLowerCase().includes(buscarTexto.toLowerCase())
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
            text="Cadastrar Parte"
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
            {partesFiltradas.map((parte) => (
              <tr key={parte.id}>
                <td>N°{String(parte.id).padStart(3, "0")}</td>
                <td>
                  <img
                    src={`${URL_BASE_IMAGEM}${parte.imagem}`}
                    alt={parte.nome}
                    style={{ width: "100px", height: "auto", objectFit: "contain" }}
                  />
                </td>
                <td>{parte.nome}</td>
                <td>
                  {parte.categoriaParteVeiculo
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </td>
                <td className="acoes">
                  <button id="editar">Editar <Pencil/></button>
                  <button id="deletar">Excluir <Trash /></button>
                </td>
              </tr>
              
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ModalCadastroParte
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            buscarPartes();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
