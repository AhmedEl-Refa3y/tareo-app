import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "patient" | "doctor" | "admin";
  doctorId?: string;
  specialty?: string;
  profileImage?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;

  // 🔥 الجديد
  setSession: (token: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // LOAD SESSION ON START
  // =========================
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);

        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Failed to load auth data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data;

    await setSession(newToken, userData);
  };

  // =========================
  // REGISTER
  // =========================
  const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    const { email } = response.data;

    await AsyncStorage.setItem("pendingEmail", email);
  };

  // =========================
  // SET SESSION (🔥 IMPORTANT)
  // =========================
  const setSession = async (newToken: string, userData: User) => {
    await AsyncStorage.setItem("token", newToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("pendingEmail");

    setToken(null);
    setUser(null);

    delete api.defaults.headers.common["Authorization"];
  };

  // =========================
  // UPDATE PROFILE
  // =========================
  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put("/auth/profile", data);
    const updatedUser = response.data.data;

    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        token,
        login,
        register,
        logout,
        updateProfile,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
