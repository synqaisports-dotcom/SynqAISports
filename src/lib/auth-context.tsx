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
  completeOnboarding: (clubData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
  completeOnboarding: () => {},
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
    // BYPASS_PROTOCOL: Identificamos como Superadmin para el acceso directo al núcleo
    const guestUser = { uid: "synq-root-dev", email: "admin@synqai.sports" };
    const guestProfile: UserProfile = {
      email: "admin@synqai.sports",
      name: "SynqAi Administrator",
      role: "superadmin",
      clubId: "global-hq",
      plan: "elite",
      clubCreated: true,
    };
    setUser(guestUser);
    setProfile(guestProfile);
  };

  const completeOnboarding = (clubData: any) => {
    if (profile) {
      setProfile({
        ...profile,
        clubCreated: true,
        clubId: clubData.id || "new-club-id",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
