import { Routes, Route } from "react-router-dom";
import Login from "../pages/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import CadastroCliente from "../pages/cadastroCliente/CadastroCliente";
import CadastroMecanico from "../pages/cadastroMecanico/CadastroMecanico";
import PrivateRoute from "../PrivateRoute";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout/AuthenticatedLayout";

export function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas protegidas com layout fixo */}
      <Route
        element={
          <PrivateRoute>
            <AuthenticatedLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route path="/cadastro-mecanico" element={<CadastroMecanico />} />
      </Route>
    </Routes>
  );
}
