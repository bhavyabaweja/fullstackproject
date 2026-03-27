import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("nexus_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("nexus_user") || "null")
  );

  const login = (tkn, usr) => {
    localStorage.setItem("nexus_token", tkn);
    localStorage.setItem("nexus_user", JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
