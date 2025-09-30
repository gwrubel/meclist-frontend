import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipo do payload decodificado do JWT
interface DecodedToken {
  sub: string;
  id: number;
  nome: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

// Interface do contexto
interface AuthContextType {
  user: DecodedToken | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props do provider
interface AuthProviderProps {
  children: ReactNode;
}

// Função para decodificar o JWT
const decodeToken = (token: string): DecodedToken => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

// Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      setUser(decodedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    const decodedUser = decodeToken(newToken);
    setUser(decodedUser);
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
