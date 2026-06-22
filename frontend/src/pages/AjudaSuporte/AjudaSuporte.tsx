import { ChangeEvent, FormEvent, useState } from "react";
import {
  ChevronDown,
  CircleHelp,
  FileText,
  LifeBuoy,
  Paperclip,
  Send,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-toastify";
import "./AjudaSuporte.css";

const FAQ_ITEMS = [
  {
    pergunta: "Como acompanho o andamento de um checklist?",
    resposta: "Acesse Checklist > Painel de serviços. As etapas Pendentes, Aguardando aprovação, Aprovados e Concluídos organizam os serviços pelo estado atual.",
  },
  {
    pergunta: "Como envio uma proposta para aprovação do cliente?",
    resposta: "Após preencher produtos, marcas, valores e mão de obra na precificação, use a ação Enviar para aprovação. O checklist passará para a etapa de aprovação administrativa.",
  },
  {
    pergunta: "Onde encontro as fotos registradas pelo mecânico?",
    resposta: "Nas telas de aprovação ou visualização completa, utilize o botão Ver fotos exibido nos itens que possuem evidências.",
  },
  {
    pergunta: "Como altero meu e-mail ou senha?",
    resposta: "Acesse Meu perfil na barra lateral. O e-mail fica em Dados da conta e a senha pode ser alterada na seção Segurança mediante confirmação da senha atual.",
  },
  {
    pergunta: "Por que uma ação do fluxo está indisponível?",
    resposta: "As ações são liberadas conforme a etapa atual. Conclua a ação indicada no fluxo de aprovação antes de avançar para a próxima.",
  },
  {
    pergunta: "Quais arquivos posso anexar a uma solicitação?",
    resposta: "A interface aceita imagens, PDFs e arquivos de texto, com até 5 anexos e limite de 10 MB por arquivo.",
  },
];

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AjudaSuporte() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);

  function handleSelecionarAnexos(event: ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(event.target.files ?? []);
    event.target.value = "";

    const acimaDoLimite = selecionados.find((arquivo) => arquivo.size > 10 * 1024 * 1024);
    if (acimaDoLimite) {
      toast.error(`O arquivo "${acimaDoLimite.name}" ultrapassa o limite de 10 MB.`);
      return;
    }

    setAnexos((atuais) => {
      const semDuplicados = selecionados.filter(
        (arquivo) => !atuais.some((atual) => atual.name === arquivo.name && atual.size === arquivo.size)
      );
      const proximos = [...atuais, ...semDuplicados];
      if (proximos.length > 5) {
        toast.error("Você pode adicionar no máximo 5 anexos.");
        return proximos.slice(0, 5);
      }
      return proximos;
    });
  }

  function handleEnviarSolicitacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (titulo.trim().length < 5) {
      toast.error("O título deve ter pelo menos 5 caracteres.");
      return;
    }
    if (descricao.trim().length < 20) {
      toast.error("Descreva a solicitação com pelo menos 20 caracteres.");
      return;
    }

    toast.info("Solicitação validada. O envio será habilitado quando o endpoint de suporte estiver disponível.");
  }

  return (
    <main className="support-page">
      <section className="support-hero-card">
        <div>
          <span className="dashboard-page__eyebrow">Central do administrador</span>
          <h1>Ajuda e suporte</h1>
          <p>Encontre respostas rápidas ou descreva um problema para a equipe responsável.</p>
        </div>
        <span className="support-hero-icon" aria-hidden="true"><LifeBuoy size={28} /></span>
      </section>

      <div className="support-integration-note" role="status">
        <UploadCloud size={18} aria-hidden="true" />
        <span><strong>Interface preparada.</strong> O envio do chamado e dos anexos será ativado após a disponibilização do endpoint.</span>
      </div>

      <div className="support-content-grid">
        <section className="support-panel support-faq-panel">
          <header className="support-panel-header">
            <span className="support-panel-icon" aria-hidden="true"><CircleHelp size={21} /></span>
            <div>
              <span className="dashboard-page__eyebrow">Dúvidas comuns</span>
              <h2>Perguntas frequentes</h2>
              <p>Consulte orientações sobre as principais rotinas do sistema.</p>
            </div>
          </header>

          <div className="support-faq-list">
            {FAQ_ITEMS.map((item, index) => (
              <details className="support-faq-item" key={item.pergunta} open={index === 0}>
                <summary>
                  <span>{item.pergunta}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <p>{item.resposta}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="support-panel">
          <header className="support-panel-header">
            <span className="support-panel-icon" aria-hidden="true"><FileText size={21} /></span>
            <div>
              <span className="dashboard-page__eyebrow">Novo atendimento</span>
              <h2>Enviar solicitação</h2>
              <p>Informe detalhes suficientes para facilitar o diagnóstico.</p>
            </div>
          </header>

          <form className="support-form" onSubmit={handleEnviarSolicitacao}>
            <label className="support-field" htmlFor="support-title">
              <span>Título</span>
              <input
                id="support-title"
                type="text"
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Resumo do problema"
                maxLength={100}
                required
              />
              <small>{titulo.length}/100 caracteres</small>
            </label>

            <label className="support-field" htmlFor="support-description">
              <span>Descrição</span>
              <textarea
                id="support-description"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Conte o que aconteceu, em qual tela e o que você esperava que ocorresse."
                rows={7}
                maxLength={2000}
                required
              />
              <small>{descricao.length}/2000 caracteres</small>
            </label>

            <div className="support-attachments">
              <span className="support-attachments-label">Anexos <small>(opcional)</small></span>
              <label className="support-upload-area" htmlFor="support-files">
                <Paperclip size={20} aria-hidden="true" />
                <span><strong>Selecionar arquivos</strong><small>Imagens, PDF ou texto • máximo de 5 arquivos • 10 MB cada</small></span>
                <input
                  id="support-files"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.log"
                  onChange={handleSelecionarAnexos}
                />
              </label>

              {anexos.length > 0 && (
                <ul className="support-file-list" aria-label="Arquivos selecionados">
                  {anexos.map((arquivo, index) => (
                    <li key={`${arquivo.name}-${arquivo.size}`}>
                      <FileText size={17} aria-hidden="true" />
                      <span><strong>{arquivo.name}</strong><small>{formatarTamanho(arquivo.size)}</small></span>
                      <button
                        type="button"
                        onClick={() => setAnexos((atuais) => atuais.filter((_, itemIndex) => itemIndex !== index))}
                        aria-label={`Remover ${arquivo.name}`}
                        title="Remover anexo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="support-submit-button">
              <Send size={17} aria-hidden="true" />
              Enviar solicitação
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
