import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./sidebar.css";
import logo from "../../assets/logo.svg";
import m from "../../assets/m.svg";
import grid from "../../assets/grid.svg";
import lista from "../../assets/lista.svg";
import relatorio from "../../assets/relatorio.svg";
import cadastro from "../../assets/cadastro.svg";
import configuracoes from "../../assets/configuracoes.svg";
import userSvg from "../../assets/user.svg";
import suporte from "../../assets/suporte.svg";
import logoutSvg from "../../assets/Logout.svg";
import setaLabelBaixo from "../../assets/setaLabelBaixo.svg";
import setaLabelLado from "../../assets/setaLabelLado.svg";


export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [relatorioOpen, setRelatorioOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!menuRef.current) return;
      const focusables = Array.from(
        menuRef.current.querySelectorAll<HTMLButtonElement>("button")
      );
      const idx = focusables.indexOf(document.activeElement as HTMLButtonElement);
      if (idx === -1) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = focusables[Math.min(focusables.length - 1, idx + 1)];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = focusables[Math.max(0, idx - 1)];
        prev?.focus();
      } else if (e.key === "ArrowRight") {
        // abre grupos com seta direita
        const el = document.activeElement as HTMLButtonElement;
        if (el?.textContent?.includes("Cadastro")) setCadastroOpen(true);
        if (el?.textContent?.includes("Checklist")) setChecklistOpen(true);
        if (el?.textContent?.includes("Relatório")) setRelatorioOpen(true);
      } else if (e.key === "ArrowLeft") {
        // fecha grupos com seta esquerda
        const el = document.activeElement as HTMLButtonElement;
        if (el?.textContent?.includes("Cadastro")) setCadastroOpen(false);
        if (el?.textContent?.includes("Checklist")) setChecklistOpen(false);
        if (el?.textContent?.includes("Relatório")) setRelatorioOpen(false);
      }
    }
    const node = menuRef.current;
    node?.addEventListener("keydown", onKeyDown);
    return () => node?.removeEventListener("keydown", onKeyDown);
  }, []);


  return (
    <aside className={`sidebar ${open ? "sidebar--open" : "sidebar--closed"}`}>
      <header className="sidebar-header">
        <button onClick={() => setOpen(!open)} className="sidebar-toggle">
          <img
            src={open ? logo : m}
            alt="Logo"
            className={`sidebar-logo ${open ? "logo-full" : "logo-mini"}`}
          />
          <span className="sidebar-chevron">{open ? "«" : "»"}</span>
        </button>
      </header>


      <nav className="sidebar-menu" ref={menuRef} aria-label="Menu lateral">
        <button onClick={() => navigate("/dashboard")} aria-label="Ir para Dashboard">
          <img src={grid} alt="grid" />
          Dashboard
        </button>

        <section className="sidebar-group">
          <button onClick={() => setCadastroOpen(!cadastroOpen)} aria-label="Abrir seção Cadastro">
            <img src={cadastro} alt="cadastro" />
            Cadastro <span>{cadastroOpen ? <img src={setaLabelBaixo} alt="seta" /> : <img src={setaLabelLado} alt="seta" />}</span>
          </button>
          {cadastroOpen && open && (
            <div className="sidebar-submenu">
              <button onClick={() => navigate("/cadastro-cliente")} aria-label="Ir para Cadastro de Clientes">
                Cadastro de Clientes
              </button>
              <button onClick={() => navigate("/cadastro-mecanico")} aria-label="Ir para Cadastro de Mecânicos">
                Cadastro de Mecânicos
              </button>
            </div>
          )}
        </section>

        <section className="sidebar-group">
          <button onClick={() => setChecklistOpen(!checklistOpen)} aria-label="Abrir seção Checklist">
            <img src={lista} alt="lista" />
            Checklist
            <span>
              {checklistOpen ? (
                <img src={setaLabelBaixo} alt="Abrir submenu" />
              ) : (
                <img src={setaLabelLado} alt="Fechar submenu" />
              )}
            </span>
          </button>
          {checklistOpen && open && (
            <div className="sidebar-submenu">
              <button onClick={() => navigate("/checklist")} aria-label="Ir para Gerenciar Checklist">
                Gerenciar Checklist
              </button>
              <button onClick={() => navigate("/parte-checklist")} aria-label="Ir para Cadastrar Itens">
                Cadastrar Itens
              </button>
            </div>
          )}
        </section>


        <section className="sidebar-group">
          <button onClick={() => setRelatorioOpen(!relatorioOpen)} aria-label="Abrir seção Relatório">
            <img src={relatorio} alt="relatorio" />
            Relatório <span>{relatorioOpen ? <img src={setaLabelBaixo} alt="seta" /> : <img src={setaLabelLado} alt="seta" />}</span>
          </button>
          {relatorioOpen && open && (
            <div className="sidebar-submenu">
              <button onClick={() => navigate("/relatorio/mensal")} aria-label="Ir para Faturamento mensal">
                Faturamento mensal
              </button>
              <button onClick={() => navigate("/relatorio/status")} aria-label="Ir para Checklist por status">
                Checklist por status
              </button>
              <button onClick={() => navigate("/relatorio/tempo")} aria-label="Ir para Tempo médio de execução">
                Tempo médio de execução
              </button>
            </div>
          )}
        </section>
      </nav>

      {open && (
        <footer className="sidebar-footer">
          <button onClick={() => navigate("/perfil")} aria-label="Ir para Perfil">
            <img src={userSvg} alt="user" />
            {user?.email}
          </button>
          <button onClick={() => navigate("/configuracoes")} aria-label="Ir para Configurações">
            <img src={configuracoes} alt="configuracaos" />
            Configurações
          </button>
          <button onClick={() => navigate("/suporte")} aria-label="Ir para Ajuda e suporte">
            <img src={suporte} alt="suporte" />
            Ajuda e suporte
          </button>
          <button onClick={logout} className="sidebar-logout" aria-label="Sair da aplicação">
            <img src={logoutSvg} alt="logout" />
            Sair
          </button>
        </footer>
      )}
    </aside>
  );
}
