import { ItemAprovacaoAdmin } from "../../types/Checklist";
import { EtapaFluxoManual } from "../../types/Checklist";
import { formatCurrency, formatarCategoria } from "./aprovacaoAdminUtils";
import { Layers3 } from "lucide-react";

type Props = {
  itensPorCategoria: Record<string, ItemAprovacaoAdmin[] | undefined>;
  decisoesProdutos: Record<number, boolean | null>;
  fluxoEncerrado: boolean;
  etapaAtual: EtapaFluxoManual;
  onDefinirDecisaoProduto: (checklistProdutoId: number, aprovado: boolean) => void;
  onDefinirDecisaoItem: (checklistProdutoIds: number[], aprovado: boolean) => void;
};

export default function AprovacaoAdminItens({
  itensPorCategoria,
  decisoesProdutos,
  fluxoEncerrado,
  etapaAtual,
  onDefinirDecisaoProduto,
  onDefinirDecisaoItem,
}: Props) {
  const podeDecidir = !fluxoEncerrado && etapaAtual === "CONFIRMACAO_REGISTRADA";
  const categorias = Object.entries(itensPorCategoria).filter(
    (entrada): entrada is [string, ItemAprovacaoAdmin[]] =>
      Boolean(entrada[1] && entrada[1].length > 0)
  );

  return (
    <div className="aprovacao-admin-itens">
      {categorias.map(([categoria, itens], categoriaIndex) => (
        <section key={categoria} className="aprovacao-admin-categoria">
          <header className="aprovacao-admin-categoria-header">
            <span className="aprovacao-admin-categoria-indice">
              {String(categoriaIndex + 1).padStart(2, "0")}
            </span>
            <span className="aprovacao-admin-categoria-icon" aria-hidden="true">
              <Layers3 size={19} />
            </span>
            <div>
              <h3>{formatarCategoria(categoria)}</h3>
              <p>{itens.length} {itens.length === 1 ? "item para revisar" : "itens para revisar"}</p>
            </div>
          </header>

          <div className="aprovacao-admin-categoria-itens">
          {itens.map((item) => (
            <div key={item.itemChecklistId} className="aprovacao-admin-item-card">
              <div className="aprovacao-admin-item-header">
                <span className="aprovacao-admin-item-nome">{item.nomeDoItem}</span>
                <span className={`aprovacao-admin-item-status status-${item.statusItem.toLowerCase()}`}>
                  {item.statusItem}
                </span>
              </div>

              {item.maoDeObra != null && (
                <div className="aprovacao-admin-item-mao-de-obra">
                  Mão de obra: {formatCurrency(item.maoDeObra)}
                </div>
              )}

              {item.produtos.length > 0 && (
                <div className="aprovacao-admin-produtos-table-wrapper">
                <table className="aprovacao-admin-produtos-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Marca</th>
                      <th>Qtd</th>
                      <th>Valor unit.</th>
                      <th>Decisão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.produtos.map((p) => (
                      <tr key={p.checklistProdutoId}>
                        <td>{p.nomeProduto}</td>
                        <td>{p.marca ?? "—"}</td>
                        <td>{p.quantidade}</td>
                        <td>{formatCurrency(p.valorUnitario)}</td>
                        <td>
                          {podeDecidir ? (
                            <div className="aprovacao-admin-radio-group">
                              <label>
                                <input
                                  type="radio"
                                  name={`decisao-${p.checklistProdutoId}`}
                                  checked={decisoesProdutos[p.checklistProdutoId] === true}
                                  onChange={() => onDefinirDecisaoProduto(p.checklistProdutoId, true)}
                                />
                                Aprovar
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`decisao-${p.checklistProdutoId}`}
                                  checked={decisoesProdutos[p.checklistProdutoId] === false}
                                  onChange={() => onDefinirDecisaoProduto(p.checklistProdutoId, false)}
                                />
                                Reprovar
                              </label>
                            </div>
                          ) : (
                            <>
                              {p.aprovadoCliente === true && <span className="badge-aprovado">Aprovado</span>}
                              {p.aprovadoCliente === false && <span className="badge-reprovado">Reprovado</span>}
                              {p.aprovadoCliente === null && <span className="badge-pendente">Pendente</span>}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              {podeDecidir && item.produtos.length > 0 && (
                <div className="aprovacao-admin-item-actions">
                  <button
                    type="button"
                    className="btn-item-aprovar"
                    onClick={() =>
                      onDefinirDecisaoItem(
                        item.produtos.map((p) => p.checklistProdutoId),
                        true
                      )
                    }
                  >
                    Aprovar item inteiro
                  </button>
                  <button
                    type="button"
                    className="btn-item-reprovar"
                    onClick={() =>
                      onDefinirDecisaoItem(
                        item.produtos.map((p) => p.checklistProdutoId),
                        false
                      )
                    }
                  >
                    Reprovar item inteiro
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
        </section>
      ))}
    </div>
  );
}
