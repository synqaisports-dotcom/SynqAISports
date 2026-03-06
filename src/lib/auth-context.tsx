
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "superadmin" | "club_admin" | "coach" | "tutor" | "athlete";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string | null;
  name: string;
  plan: string | null;
  clubCreated: boolean;
  claimedToken?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAsGuest: () => void;
  loginWithToken: (token: string, plan: string) => void;
  completeOnboarding: (clubData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
  loginWithToken: () => {},
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
      plan: "enterprise_scale",
      clubCreated: true,
    };
    
    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  }, []);

  const loginAsGuest = () => {
    const guestUser = { uid: "synq-root-dev", email: "admin@synqai.sports" };
    const guestProfile: UserProfile = {
      email: "admin@synqai.sports",
      name: "SynqAi Administrator",
      role: "superadmin",
      clubId: "global-hq",
      plan: "enterprise_scale",
      clubCreated: true,
    };
    setUser(guestUser);
    setProfile(guestProfile);
  };

  const loginWithToken = (token: string, plan: string) => {
    // Simulamos el login de un nuevo administrador de club vía Token
    const newUser = { uid: `user-${Math.random().toString(36).substr(2, 9)}`, email: "pending@club.com" };
    const newProfile: UserProfile = {
      email: "pending@club.com",
      name: "New Admin",
      role: "club_admin",
      clubId: null,
      plan: plan,
      clubCreated: false,
      claimedToken: token
    };
    setUser(newUser);
    setProfile(newProfile);
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
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest, loginWithToken, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
