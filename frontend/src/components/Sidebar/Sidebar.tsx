import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.svg";
import m from "../../assets/m.svg";
import "./sidebar.css";

const cadastroPaths = [
  "/cadastro-cliente",
  "/cadastro-mecanico",
  "/cliente/",
  "/mecanicos/",
];

const checklistPaths = [
  "/gerenciar-checklist",
  "/itens-do-checklist",
  "/checklist/",
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [cadastroOpen, setCadastroOpen] = useState(() =>
    cadastroPaths.some(
      (path) =>
        pathname === path || (path.endsWith("/") && pathname.startsWith(path))
    )
  );
  const [checklistOpen, setChecklistOpen] = useState(() =>
    checklistPaths.some(
      (path) =>
        pathname === path || (path.endsWith("/") && pathname.startsWith(path))
    )
  );

  const menuRef = useRef<HTMLElement>(null);

  const matchesPath = (path: string) =>
    pathname === path || (path.endsWith("/") && pathname.startsWith(path));

  const cadastroActive = cadastroPaths.some(matchesPath);
  const checklistActive = checklistPaths.some(matchesPath);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!menuRef.current) return;

      const focusables = Array.from(
        menuRef.current.querySelectorAll<HTMLButtonElement>(
          'button:not([tabindex="-1"])'
        )
      );
      const index = focusables.indexOf(
        document.activeElement as HTMLButtonElement
      );

      if (index === -1) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusables[Math.min(focusables.length - 1, index + 1)]?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        focusables[Math.max(0, index - 1)]?.focus();
      } else if (event.key === "ArrowRight") {
        const group = (
          document.activeElement as HTMLButtonElement
        )?.dataset.menuGroup;

        if (group === "cadastro") {
          setOpen(true);
          setCadastroOpen(true);
        }
        if (group === "checklist") {
          setOpen(true);
          setChecklistOpen(true);
        }
      } else if (event.key === "ArrowLeft") {
        const group = (
          document.activeElement as HTMLButtonElement
        )?.dataset.menuGroup;

        if (group === "cadastro") setCadastroOpen(false);
        if (group === "checklist") setChecklistOpen(false);
      }
    }

    const node = menuRef.current;
    node?.addEventListener("keydown", onKeyDown);
    return () => node?.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleGroup(group: "cadastro" | "checklist") {
    if (!open) {
      setOpen(true);
      if (group === "cadastro") setCadastroOpen(true);
      if (group === "checklist") setChecklistOpen(true);
      return;
    }

    if (group === "cadastro") setCadastroOpen((current) => !current);
    if (group === "checklist") setChecklistOpen((current) => !current);
  }

  const userEmail = user?.email ?? "Meu perfil";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <aside
      className={`sidebar ${open ? "sidebar--open" : "sidebar--closed"}`}
      aria-label="Navegação principal"
    >
      <header className="sidebar-header">
        {open ? (
          <>
            <div className="sidebar-brand" aria-label="Meclist">
              <img
                src={logo}
                alt="Meclist"
                className="sidebar-logo logo-full"
              />
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="sidebar-toggle"
              aria-label="Recolher menu lateral"
              title="Recolher menu"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <>
            <div
            className="sidebar-brand sidebar-brand--compact"
              aria-label="Meclist"
            >
              <img src={m} alt="Meclist" className="sidebar-logo logo-mini" />
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="sidebar-toggle sidebar-toggle--compact"
              aria-label="Expandir menu lateral"
              title="Expandir menu"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </header>

      <nav className="sidebar-menu" ref={menuRef} aria-label="Menu lateral">
        <span className="sidebar-section-label">Navegação</span>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className={`sidebar-item ${
            pathname === "/dashboard" ? "sidebar-item--active" : ""
          }`}
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          aria-label="Ir para Dashboard"
          title={!open ? "Dashboard" : undefined}
        >
          <span className="sidebar-item-icon" aria-hidden="true">
            <LayoutDashboard size={20} />
          </span>
          <span className="sidebar-label">Dashboard</span>
        </button>

        <section className="sidebar-group" aria-label="Cadastro">
          <button
            type="button"
            onClick={() => toggleGroup("cadastro")}
            className={`sidebar-item ${
              cadastroActive ? "sidebar-item--active" : ""
            }`}
            aria-label="Abrir seção Cadastro"
            aria-expanded={open && cadastroOpen}
            aria-controls="cadastro-submenu"
            data-menu-group="cadastro"
            title={!open ? "Cadastro" : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">
              <UsersRound size={20} />
            </span>
            <span className="sidebar-label">Cadastro</span>
            <ChevronDown
              size={17}
              className={`sidebar-group-chevron ${
                cadastroOpen ? "sidebar-group-chevron--open" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id="cadastro-submenu"
            className={`sidebar-submenu-wrapper ${
              open && cadastroOpen ? "sidebar-submenu-wrapper--open" : ""
            }`}
            aria-hidden={!open || !cadastroOpen}
          >
            <div className="sidebar-submenu">
              <button
                type="button"
                onClick={() => navigate("/cadastro-cliente")}
                className={
                  pathname === "/cadastro-cliente"
                    ? "sidebar-subitem--active"
                    : ""
                }
                aria-current={
                  pathname === "/cadastro-cliente" ? "page" : undefined
                }
                aria-label="Ir para Cadastro de Clientes"
                tabIndex={open && cadastroOpen ? 0 : -1}
              >
                <span className="sidebar-subitem-dot" aria-hidden="true" />
                Gerenciar clientes
              </button>
              <button
                type="button"
                onClick={() => navigate("/cadastro-mecanico")}
                className={
                  pathname === "/cadastro-mecanico"
                    ? "sidebar-subitem--active"
                    : ""
                }
                aria-current={
                  pathname === "/cadastro-mecanico" ? "page" : undefined
                }
                aria-label="Ir para Cadastro de Mecânicos"
                tabIndex={open && cadastroOpen ? 0 : -1}
              >
                <span className="sidebar-subitem-dot" aria-hidden="true" />
                Gerenciar mecânicos
              </button>
            </div>
          </div>
        </section>

        <section className="sidebar-group" aria-label="Checklist">
          <button
            type="button"
            onClick={() => toggleGroup("checklist")}
            className={`sidebar-item ${
              checklistActive ? "sidebar-item--active" : ""
            }`}
            aria-label="Abrir seção Checklist"
            aria-expanded={open && checklistOpen}
            aria-controls="checklist-submenu"
            data-menu-group="checklist"
            title={!open ? "Checklist" : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">
              <ClipboardCheck size={20} />
            </span>
            <span className="sidebar-label">Checklist</span>
            <ChevronDown
              size={17}
              className={`sidebar-group-chevron ${
                checklistOpen ? "sidebar-group-chevron--open" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id="checklist-submenu"
            className={`sidebar-submenu-wrapper ${
              open && checklistOpen ? "sidebar-submenu-wrapper--open" : ""
            }`}
            aria-hidden={!open || !checklistOpen}
          >
            <div className="sidebar-submenu">
              <button
                type="button"
                onClick={() => navigate("/gerenciar-checklist")}
                className={
                  pathname === "/gerenciar-checklist"
                    ? "sidebar-subitem--active"
                    : ""
                }
                aria-current={
                  pathname === "/gerenciar-checklist" ? "page" : undefined
                }
                aria-label="Ir para Gerenciar Checklist"
                tabIndex={open && checklistOpen ? 0 : -1}
              >
                <span className="sidebar-subitem-dot" aria-hidden="true" />
                Painel de serviços
              </button>
              <button
                type="button"
                onClick={() => navigate("/itens-do-checklist")}
                className={
                  pathname === "/itens-do-checklist"
                    ? "sidebar-subitem--active"
                    : ""
                }
                aria-current={
                  pathname === "/itens-do-checklist" ? "page" : undefined
                }
                aria-label="Ir para Cadastrar Itens"
                tabIndex={open && checklistOpen ? 0 : -1}
              >
                <span className="sidebar-subitem-dot" aria-hidden="true" />
                Itens do checklist
              </button>
            </div>
          </div>
        </section>
      </nav>

      <footer className="sidebar-footer">
        <span className="sidebar-section-label">Conta</span>

        <button
          type="button"
          onClick={() => navigate("/perfil")}
          className={`sidebar-profile ${
            pathname === "/perfil" ? "sidebar-item--active" : ""
          }`}
          aria-label="Ir para Perfil"
          title={!open ? userEmail : undefined}
        >
          <span className="sidebar-avatar" aria-hidden="true">
            {userInitial}
          </span>
          <span className="sidebar-user-details">
            <strong>Meu perfil</strong>
            <small>{userEmail}</small>
          </span>
        </button>

        <div className="sidebar-footer-actions">
          <button
            type="button"
            onClick={() => navigate("/suporte")}
            className={`sidebar-footer-item ${
              pathname === "/suporte" ? "sidebar-item--active" : ""
            }`}
            aria-label="Ir para Ajuda e suporte"
            title={!open ? "Ajuda e suporte" : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">
              <CircleHelp size={19} />
            </span>
            <span className="sidebar-label">Ajuda e suporte</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="sidebar-footer-item sidebar-logout"
            aria-label="Sair da aplicação"
            title={!open ? "Sair" : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">
              <LogOut size={19} />
            </span>
            <span className="sidebar-label">Sair</span>
          </button>
        </div>
      </footer>
    </aside>
  );
}
