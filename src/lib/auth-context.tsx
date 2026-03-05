"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "superadmin" | "club_admin" | "coach" | "tutor" | "athlete";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string | null;
  name: string;
  plan: "basic" | "pro" | "elite" | null;
  clubCreated: boolean;
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
    // PROTOCOLO_DE_ACCESO: En desarrollo, asignamos un Superadmin por defecto
    const mockUser = { uid: "synq-root-dev", email: "root@synqai.sports" };
    const mockProfile: UserProfile = {
      email: "root@synqai.sports",
      name: "SynqAi Root",
      role: "superadmin",
      clubId: "global-hq",
      plan: "elite",
      clubCreated: true,
    };
    
    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const loginAsGuest = () => {
    const guestUser = { uid: "guest-club-dev", email: "nuevo@club.sports" };
    const guestProfile: UserProfile = {
      email: "nuevo@club.sports",
      name: "Nuevo Entrenador",
      role: "coach",
      clubId: null, // Sin club inicial
      plan: "pro",
      clubCreated: false, // Forzará el onboarding de club
    };
    setUser(guestUser);
    setProfile(guestProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
