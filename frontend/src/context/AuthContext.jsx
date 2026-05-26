import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const res = await getMe();
          if (res.success && res.user) {
            setIsLoggedIn(true);
            setUser(res.user);
          } else {
            localStorage.removeItem("authToken");
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token, userData) => {
    if (token) {
      localStorage.setItem("authToken", token);
    }
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);