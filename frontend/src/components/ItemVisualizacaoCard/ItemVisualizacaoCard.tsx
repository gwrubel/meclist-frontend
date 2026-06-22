import { useState } from "react";
import { Camera } from "lucide-react";
import { ItemVisualizacao } from '../../types/Checklist';
import ModalFotosEvidencia, { FotoEvidencia } from '../ModalFotosEvidencia/ModalFotosEvidencia';
import { useAuth } from "../../contexts/AuthContext";
import { buildApiUrl } from "../../config/api";
import "./ItemVisualizacaoCard.css";

type Props = {
  item: ItemVisualizacao;
};

type StatusAprovacao = "APROVADO" | "REPROVADO" | "PARCIAL" | "PENDENTE";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function getStatusProduto(aprovadoCliente?: boolean | null): "aprovado" | "reprovado" | "pendente" {
  if (aprovadoCliente === true) {
    return "aprovado";
  }
  if (aprovadoCliente === false) {
    return "reprovado";
  }
  return "pendente";
}

function getStatusItem(item: ItemVisualizacao): StatusAprovacao {
  if (item.produtos.length === 0) {
    return "PENDENTE";
  }

  const totalAprovados = item.produtos.filter((produto) => produto.aprovadoCliente === true).length;
  const totalReprovados = item.produtos.filter((produto) => produto.aprovadoCliente === false).length;

  if (totalAprovados === item.produtos.length) {
    return "APROVADO";
  }

  if (totalReprovados === item.produtos.length) {
    return "REPROVADO";
  }

  if (totalAprovados > 0 && totalReprovados > 0) {
    return "PARCIAL";
  }

  return "PENDENTE";
}

function getTextoStatusItem(status: StatusAprovacao): string {
  if (status === "APROVADO") {
    return "Item aprovado";
  }
  if (status === "REPROVADO") {
    return "Item reprovado";
  }
  if (status === "PARCIAL") {
    return "Parcialmente aprovado";
  }
  return "Pendente";
}

function getClasseStatusItem(status: StatusAprovacao): string {
  if (status === "APROVADO") {
    return "badge-aprovado";
  }
  if (status === "REPROVADO") {
    return "badge-reprovado";
  }
  if (status === "PARCIAL") {
    return "badge-parcial";
  }
  return "badge-pendente";
}

export default function ItemVisualizacaoCard({ item }: Props) {
  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [fotosModal, setFotosModal] = useState<FotoEvidencia[]>([]);
  const { token } = useAuth();

  const abrirModalFotos = async () => {
    setLoadingFotos(true);
    setModalFotoAberto(true);
    try {
      const res = await fetch(buildApiUrl(`/checklists/${item.id}/fotos-evidencia`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      const fotos: FotoEvidencia[] = (body.data ?? []).map(
        (f: { id: number; url: string }) => ({ id: f.id, url: f.url })
      );
      setFotosModal(fotos);
    } catch {
      setFotosModal([]);
    } finally {
      setLoadingFotos(false);
    }
  };

  const totalProdutosAprovados = item.produtos.reduce(
    (soma, produto) =>
      produto.aprovadoCliente === true
        ? soma + produto.precoUnitario * produto.quantidade
        : soma,
    0
  );
  const temProdutoAprovado = item.produtos.some((produto) => produto.aprovadoCliente === true);
  const totalItem = temProdutoAprovado ? totalProdutosAprovados + item.maoDeObraValor : 0;
  const statusItemAprovacao = getStatusItem(item);

  return (
    <div className="item-visualizacao-card">
      <header className="item-visualizacao-card-header">
        <div className="item-visualizacao-card-header-left">
          <span>{item.descricao}</span>
          <span className={`item-visualizacao-card-resumo-status ${getClasseStatusItem(statusItemAprovacao)}`}>
            {getTextoStatusItem(statusItemAprovacao)}
          </span>
        </div>
        <div className="item-visualizacao-card-header-actions">
          {item.fotos.length > 0 && (
            <button
              type="button"
              className="item-visualizacao-card-ver-fotos"
              aria-label={`Ver ${item.fotos.length} foto(s) de ${item.descricao}`}
              onClick={abrirModalFotos}
            >
              <Camera size={16} />
              Ver fotos ({item.fotos.length})
            </button>
          )}
        </div>
      </header>

      <div className="item-visualizacao-card-table-wrapper">
        <table className="item-visualizacao-card-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca / Produto Específico</th>
              <th>Aprovação do Cliente</th>
              <th>Qtd</th>
              <th>Valor Unitário</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {item.produtos.length === 0 ? (
              <tr>
                <td colSpan={6} className="item-visualizacao-card-vazio">
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              item.produtos.map((produto, index) => (
                <tr key={index}>
                  <td>{produto.descricao}</td>
                  <td>{produto.marca || "-"}</td>
                  <td>
                    {getStatusProduto(produto.aprovadoCliente) === "aprovado" && (
                      <span className="badge-aprovado">Aprovado</span>
                    )}
                    {getStatusProduto(produto.aprovadoCliente) === "reprovado" && (
                      <span className="badge-reprovado">Reprovado</span>
                    )}
                    {getStatusProduto(produto.aprovadoCliente) === "pendente" && (
                      <span className="badge-pendente">Pendente</span>
                    )}
                  </td>
                  <td className="item-visualizacao-card-qtd">{produto.quantidade}</td>
                  <td className="item-visualizacao-card-valor">
                    {formatarMoeda(produto.precoUnitario)}
                  </td>
                  <td className="item-visualizacao-card-subtotal">
                    {formatarMoeda(produto.precoUnitario * produto.quantidade)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="item-visualizacao-card-footer">
        <div className="item-visualizacao-card-mao-de-obra">
          <span>Mão de obra:</span>
          <strong>{formatarMoeda(item.maoDeObraValor)}</strong>
        </div>
        <div className="item-visualizacao-card-total-item">
          Total aprovado do item: <strong>{formatarMoeda(totalItem)}</strong>
        </div>
      </div>

      {modalFotoAberto && (
        <ModalFotosEvidencia
          isOpen={modalFotoAberto}
          onClose={() => setModalFotoAberto(false)}
          nomeItem={item.descricao}
          fotos={fotosModal}
          loading={loadingFotos}
        />
      )}
    </div>
  );
}
