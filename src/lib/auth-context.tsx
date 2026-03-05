"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "superadmin" | "club_admin" | "coach" | "tutor";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PROTOCOLO_DE_RECONSTRUCCIÓN: Acceso total automático
    const mockUser = { uid: "dev-root", email: "admin@synqsports.pro" };
    const mockProfile: UserProfile = {
      email: "admin@synqsports.pro",
      role: "superadmin",
      clubId: "global",
    };
    
    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const loginAsGuest = () => {};

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
