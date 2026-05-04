import { useEffect, useRef, useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import { ItemChecklistDetalhe, ProdutoPrecificado } from '../../types/Checklist';
import { tProduto } from '../../types/Produtos';
import { SelectCustom } from '../Select/SelectCustom';
import ModalFotosEvidencia, { FotoEvidencia } from '../ModalFotosEvidencia/ModalFotosEvidencia';
import "./ItemPrecificacaoCard.css";
import { buildApiUrl } from "../../config/api";


type Props = {
  item: ItemChecklistDetalhe;
  token: string;
  onChange: (produtos: ProdutoPrecificado[], maoDeObra: number) => void;
};

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Input no estilo caixa eletrônica: digita centavos da direita pra esquerda
function CurrencyInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  // Guarda os centavos como inteiro (ex: R$ 1,23 = 123 centavos)
  const [centavos, setCentavos] = useState(() => Math.round(value * 100));

  useEffect(() => {
    setCentavos(Math.round(value * 100));
  }, [value]);

  const display = (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const novo = Math.min(centavos * 10 + Number(e.key), 9_999_999);
      setCentavos(novo);
      onChange(novo / 100);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      const novo = Math.floor(centavos / 10);
      setCentavos(novo);
      onChange(novo / 100);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      value={display}
      onKeyDown={handleKeyDown}
      onChange={() => {}}
      readOnly={false}
    />
  );
}

export default function ItemPrecificacaoCard({ item, token, onChange }: Props) {
  const [produtos, setProdutos] = useState<ProdutoPrecificado[]>(
    item.produtos.map((p) => ({
      ...p,
      marca: p.marca ?? "",
      valorUnitario: p.valorUnitario ?? 0,
    }))
  );
  const [maoDeObra, setMaoDeObra] = useState(0);

  const [mostrarSeletor, setMostrarSeletor] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<tProduto[]>([]);
  const [buscandoProdutos, setBuscandoProdutos] = useState(false);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState("");
  const tempIdRef = useRef(-1);

  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [loadingFotos, setLoadingFotos] = useState(false);
  const [fotosModal, setFotosModal] = useState<FotoEvidencia[]>([]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Notifica a page sempre que produtos ou mão de obra mudarem
  useEffect(() => {
    onChangeRef.current(produtos, maoDeObra);
  }, [produtos, maoDeObra]);

  const abrirModalFotos = async () => {
    setLoadingFotos(true);
    setModalFotoAberto(true);
    try {
      const res = await fetch(buildApiUrl(`/checklists/${item.itemChecklistId}/fotos-evidencia`), {
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

  const abrirSeletor = async () => {
    if (mostrarSeletor) {
      setMostrarSeletor(false);
      return;
    }
    setBuscandoProdutos(true);
    try {
      const res = await fetch(buildApiUrl(`/itens/${item.itemId}/produtos`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const lista: tProduto[] = Array.isArray(json) ? json : json.data ?? [];
      setProdutosDisponiveis(lista.filter((p) => p.situacao === "ATIVO"));
      setProdutoSelecionadoId("");
      setMostrarSeletor(true);
    } finally {
      setBuscandoProdutos(false);
    }
  };

  const confirmarAdicaoProduto = () => {
    const produtoId = Number(produtoSelecionadoId);
    if (!produtoId) return;
    const encontrado = produtosDisponiveis.find((p) => p.produtoId === produtoId);
    if (!encontrado) return;
    const novo: ProdutoPrecificado = {
      checklistProdutoId: tempIdRef.current--,
      produtoId: encontrado.produtoId,
      nomeProduto: encontrado.nomeProduto,
      quantidade: 1,
      marca: "",
      valorUnitario: 0,
    };
    setProdutos((prev) => [...prev, novo]);
    setMostrarSeletor(false);
    setProdutoSelecionadoId("");
  };

  const atualizarProduto = (
    index: number,
    campo: keyof ProdutoPrecificado,
    valor: string | number
  ) => {
    setProdutos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [campo]: valor } : p))
    );
  };

  const removerProduto = (index: number) => {
    setProdutos((prev) => prev.filter((_, i) => i !== index));
  };

  const totalProdutos = produtos.reduce(
    (s, p) => s + p.valorUnitario * p.quantidade,
    0
  );
  const totalItem = totalProdutos + maoDeObra;

  return (
    <div className="item-card">
      <header className="item-card-header">
        <span>{item.nomeDoItem}</span>
        {item.fotos.length > 0 && (
          <button
            type="button"
            className="item-card-ver-fotos"
            aria-label={`Ver ${item.fotos.length} foto(s) de ${item.nomeDoItem}`}
            onClick={abrirModalFotos}
          >
            <Camera size={16} />
            Ver fotos ({item.fotos.length})
          </button>
        )}
      </header>

      <div className="item-card-table-wrapper">
        <table className="item-card-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Marca / Produto Específico</th>
              <th>Qtd</th>
              <th>Valor Unitário</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto, index) => (
              <tr key={produto.checklistProdutoId}>
                <td>{produto.nomeProduto}</td>
                <td>
                  <input
                    type="text"
                    className="item-card-input"
                    placeholder="Ex: Cofap"
                    value={produto.marca}
                    onChange={(e) =>
                      atualizarProduto(index, "marca", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="item-card-input item-card-input--qtd"
                    value={produto.quantidade}
                    onChange={(e) =>
                      atualizarProduto(index, "quantidade", Number(e.target.value))
                    }
                  />
                </td>
                <td>
                  <CurrencyInput
                    className="item-card-input item-card-input--valor"
                    value={produto.valorUnitario}
                    onChange={(v) => atualizarProduto(index, "valorUnitario", v)}
                  />
                </td>
                <td className="item-card-subtotal">
                  {formatarMoeda(produto.valorUnitario * produto.quantidade)}
                </td>
                <td>
                  <button
                    type="button"
                    className="item-card-remover"
                    aria-label={`Remover ${produto.nomeProduto}`}
                    onClick={() => removerProduto(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="item-card-adicionar-area">
        <button
          type="button"
          className="item-card-btn-adicionar"
          onClick={abrirSeletor}
          disabled={buscandoProdutos}
          aria-label="Adicionar produto ao item"
        >
          <Plus size={14} />
          {buscandoProdutos ? "Buscando..." : "Adicionar produto"}
        </button>

        {mostrarSeletor && (
          <div className="item-card-seletor">
            <div className="item-card-select-wrapper">
              <SelectCustom
                options={produtosDisponiveis.map((p) => ({
                  label: p.nomeProduto,
                  value: String(p.produtoId),
                }))}
                value={produtoSelecionadoId}
                onChange={setProdutoSelecionadoId}
                placeholder="Selecione um produto..."
                ariaLabel="Produto para adicionar"
              />
            </div>
            <button
              type="button"
              className="item-card-btn-confirmar"
              onClick={confirmarAdicaoProduto}
              disabled={!produtoSelecionadoId}
            >
              Adicionar
            </button>
            <button
              type="button"
              className="item-card-btn-cancelar"
              onClick={() => setMostrarSeletor(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <footer className="item-card-footer">
        <div className="item-card-mao-de-obra">
          <label>Total de mão de obra:</label>
          <CurrencyInput
            className="item-card-input item-card-input--valor"
            value={maoDeObra}
            onChange={setMaoDeObra}
          />
        </div>
        <p className="item-card-total-item">
          Total do item: <span>{formatarMoeda(totalItem)}</span>
        </p>
      </footer>
      <ModalFotosEvidencia
        isOpen={modalFotoAberto}
        onClose={() => setModalFotoAberto(false)}
        nomeItem={item.nomeDoItem}
        fotos={fotosModal}
        loading={loadingFotos}
      />
    </div>
  );
}