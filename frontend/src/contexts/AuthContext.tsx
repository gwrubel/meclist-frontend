import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

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

// Funções auxiliares de segurança
const isTokenExpired = (decoded: DecodedToken | null): boolean => {
  if (!decoded) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return typeof decoded.exp === "number" && decoded.exp <= nowInSeconds;
};

const safeDecode = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (_e) {
    return null;
  }
};

// Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      const decodedUser = safeDecode(storedToken);
      if (!decodedUser || isTokenExpired(decodedUser)) {
        localStorage.removeItem("authToken");
      } else {
        setUser(decodedUser);
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    const decodedUser = safeDecode(newToken);
    if (!decodedUser || isTokenExpired(decodedUser)) {
      // Token inválido/expirado: não persistir
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");
      return;
    }
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
