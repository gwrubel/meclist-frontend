import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Search,
  UserRoundCheck,
  UsersRound,
  UserX,
  Wrench,
} from "lucide-react";
import Modal from "../../layouts/Modal/Modal";
import Loading from "../Loading/Loading";
import { buildApiUrl } from "../../config/api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { aplicarMascaraTelefone } from "../../utils/maskUtils";
import { tMecanico } from "../../types/Mecanico";
import "./ModalEncaminharMecanico.css";

interface ModalEncaminharMecanicoProps {
  checklistId: number;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEncaminharMecanico({
  checklistId,
  token,
  isOpen,
  onClose,
  onSuccess,
}: ModalEncaminharMecanicoProps) {
  const [mecanicos, setMecanicos] = useState<tMecanico[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [vinculando, setVinculando] = useState<number | null>(null);

  const buscarMecanicos = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(buildApiUrl("/mecanicos"));
      url.searchParams.append("situacao", "ATIVO");
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Erro ao buscar mecânicos");
      const data = await response.json();
      setMecanicos(data.data ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao buscar mecânicos";
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      setBusca("");
      buscarMecanicos();
    }
  }, [isOpen, buscarMecanicos]);

  const mecanicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return mecanicos;

    return mecanicos.filter((mecanico) =>
      [mecanico.nome, mecanico.email, mecanico.telefone]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }, [busca, mecanicos]);

  const handleVincular = async (mecanicoId: number) => {
    try {
      setVinculando(mecanicoId);
      const response = await fetch(
        buildApiUrl(`/admin/checklists/${checklistId}/servico`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mecanicoId }),
        }
      );
      if (response.status === 204) {
        showSuccessToast("Serviço vinculado ao mecânico com sucesso.");
        onSuccess();
        return;
      }
      showErrorToast("Erro ao vincular o serviço. Tente novamente.");
    } catch {
      showErrorToast("Erro ao vincular o serviço. Tente novamente.");
    } finally {
      setVinculando(null);
    }
  };

  const handleClose = () => {
    if (vinculando === null) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} header="Vincular serviço a um mecânico">
      <div className="encaminhar-mecanico-modal">
        <div className="encaminhar-mecanico-contexto">
          <span className="encaminhar-mecanico-contexto-icon" aria-hidden="true">
            <Wrench size={21} />
          </span>
          <div>
            <span>Checklist #{checklistId}</span>
            <strong>Selecione o profissional responsável</strong>
            <p>O serviço ficará disponível para o mecânico escolhido.</p>
          </div>
        </div>

        {!loading && mecanicos.length > 0 && (
          <label className="encaminhar-mecanico-busca" htmlFor="buscar-mecanico-vinculo">
            <Search size={17} aria-hidden="true" />
            <input
              id="buscar-mecanico-vinculo"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone"
              autoComplete="off"
            />
          </label>
        )}

        <div className="encaminhar-mecanico-conteudo">
          {loading ? (
            <div className="encaminhar-mecanico-loading"><Loading /></div>
          ) : mecanicos.length === 0 ? (
            <div className="encaminhar-mecanico-empty">
              <UserX size={25} aria-hidden="true" />
              <strong>Nenhum mecânico ativo</strong>
              <p>Cadastre ou reative um mecânico para vincular este serviço.</p>
            </div>
          ) : mecanicosFiltrados.length === 0 ? (
            <div className="encaminhar-mecanico-empty">
              <Search size={24} aria-hidden="true" />
              <strong>Nenhum resultado encontrado</strong>
              <p>Tente pesquisar usando outro nome, e-mail ou telefone.</p>
            </div>
          ) : (
            <ul className="encaminhar-mecanico-lista">
              {mecanicosFiltrados.map((mecanico) => (
                <li key={mecanico.id} className="encaminhar-mecanico-item">
                  <span className="encaminhar-mecanico-avatar" aria-hidden="true">
                    {mecanico.nome.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="encaminhar-mecanico-info">
                    <span className="encaminhar-mecanico-codigo">
                      MEC-{String(mecanico.id).padStart(3, "0")}
                    </span>
                    <strong className="encaminhar-mecanico-nome">{mecanico.nome}</strong>
                    <span className="encaminhar-mecanico-telefone">
                      {aplicarMascaraTelefone(mecanico.telefone)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-vincular"
                    disabled={vinculando !== null}
                    onClick={() => handleVincular(mecanico.id)}
                    aria-label={`Vincular serviço ao mecânico ${mecanico.nome}`}
                  >
                    {vinculando === mecanico.id ? (
                      <LoaderCircle className="encaminhar-mecanico-spinner" size={16} aria-hidden="true" />
                    ) : (
                      <UserRoundCheck size={16} aria-hidden="true" />
                    )}
                    {vinculando === mecanico.id ? "Vinculando..." : "Vincular"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="encaminhar-mecanico-actions">
          {!loading && mecanicos.length > 0 && (
            <span>
              <UsersRound size={16} aria-hidden="true" />
              {mecanicosFiltrados.length} {mecanicosFiltrados.length === 1 ? "mecânico disponível" : "mecânicos disponíveis"}
            </span>
          )}
          <button
            type="button"
            className="btn-secundario"
            onClick={handleClose}
            disabled={vinculando !== null}
          >
            Cancelar
          </button>
        </footer>
      </div>
    </Modal>
  );
}
