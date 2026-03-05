"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "superadmin" | "club_admin" | "coach" | "tutor" | "athlete";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string;
  name: string;
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
    // PROTOCOLO_DE_ACCESO_LIBRE: Identidad de Root por defecto para reconstrucción
    const mockUser = { uid: "synq-root-dev", email: "root@synqai.sports" };
    const mockProfile: UserProfile = {
      email: "root@synqai.sports",
      name: "SynqAi Root",
      role: "superadmin",
      clubId: "global-hq",
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
