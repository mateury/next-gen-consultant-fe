"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  bgColor?: string;
  emoji?: string;
}

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: Avatar;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAvatarSelected: boolean;
  user: User | null;
  login: (userData: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  }) => void;
  updateUserAvatar: (avatar: Avatar) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAvatarSelected, setIsAvatarSelected] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  }) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAvatarSelected(false); // Reset avatar selection when logging in
  };

  const updateUserAvatar = (avatar: Avatar) => {
    if (user) {
      setUser({ ...user, avatar });
      setIsAvatarSelected(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAvatarSelected(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAvatarSelected,
        user,
        login,
        updateUserAvatar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
