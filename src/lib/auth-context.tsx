"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "superadmin" | "club_admin" | "coach" | "promo_coach" | "tutor" | "athlete";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string | null;
  name: string;
  plan: 'free' | 'volumen_core' | 'enterprise_scale' | null;
  country: string | null;
  sport?: string;
  clubCreated: boolean;
  clubName?: string;
  claimedToken?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAsGuest: () => void;
  loginWithToken: (token: string, plan: string, country: string) => void;
  register: (email: string, pass: string, name: string, clubName: string, plan?: 'free' | 'enterprise_scale') => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  completeOnboarding: (clubData: { name: string; id: string; country: string; sport: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
  loginWithToken: () => {},
  register: async () => {},
  login: async () => {},
  completeOnboarding: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem("synq_profile");
    const savedUser = localStorage.getItem("synq_user");
    
    if (savedProfile && savedUser) {
      setProfile(JSON.parse(savedProfile));
      setUser(JSON.parse(savedUser));
    }
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
      country: "ES",
      sport: "Multideporte",
      clubCreated: true,
    };
    
    setUser(guestUser);
    setProfile(guestProfile);
    
    localStorage.setItem("synq_user", JSON.stringify(guestUser));
    localStorage.setItem("synq_profile", JSON.stringify(guestProfile));
  };

  const register = async (email: string, pass: string, name: string, clubName: string, plan: 'free' | 'enterprise_scale' = 'free') => {
    // Simulación de registro en prototipo
    const newUser = { uid: `u-${Date.now()}`, email };
    const newProfile: UserProfile = {
      email,
      name,
      role: plan === 'free' ? "promo_coach" : "club_admin",
      clubId: null,
      plan,
      country: "ES",
      clubCreated: false,
      clubName
    };

    setUser(newUser);
    setProfile(newProfile);
    localStorage.setItem("synq_user", JSON.stringify(newUser));
    localStorage.setItem("synq_profile", JSON.stringify(newProfile));
  };

  const login = async (email: string, pass: string) => {
    // Simulación de login en prototipo
    const guestUser = { uid: "u-simulated", email };
    const guestProfile: UserProfile = {
      email: "u-simulated@synqai.com",
      name: "Usuario Sincronizado",
      role: "promo_coach",
      clubId: "club-simulated",
      plan: "free",
      country: "ES",
      clubCreated: true,
    };
    
    setUser(guestUser);
    setProfile(guestProfile);
    localStorage.setItem("synq_user", JSON.stringify(guestUser));
    localStorage.setItem("synq_profile", JSON.stringify(guestProfile));
  };

  const loginWithToken = (token: string, plan: any, country: string) => {
    const newUser = { uid: `user-${Math.random().toString(36).substr(2, 9)}`, email: "pending@club.com" };
    const newProfile: UserProfile = {
      email: "pending@club.com",
      name: "Nuevo Administrador",
      role: "club_admin",
      clubId: null,
      plan: plan.toLowerCase().replace(' ', '_'),
      country: country,
      clubCreated: false,
      claimedToken: token
    };
    
    setUser(newUser);
    setProfile(newProfile);
    
    localStorage.setItem("synq_user", JSON.stringify(newUser));
    localStorage.setItem("synq_profile", JSON.stringify(newProfile));
  };

  const completeOnboarding = (clubData: { name: string; id: string; country: string; sport: string }) => {
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        clubCreated: true,
        clubId: clubData.id,
        clubName: clubData.name,
        country: clubData.country,
        sport: clubData.sport
      };
      setProfile(updatedProfile);
      localStorage.setItem("synq_profile", JSON.stringify(updatedProfile));
      
      const existingClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
      const newClubEntry = {
        id: clubData.id,
        name: clubData.name,
        plan: profile.plan || "free",
        users: 1,
        status: "Active",
        country: clubData.country,
        sport: clubData.sport
      };
      localStorage.setItem("synq_global_clubs", JSON.stringify([...existingClubs, newClubEntry]));
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("synq_user");
    localStorage.removeItem("synq_profile");
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest, loginWithToken, register, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);