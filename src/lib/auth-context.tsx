"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "superadmin" | "club_admin" | "coach" | "promo_coach" | "tutor" | "athlete";

const ADMIN_EMAILS = ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com', 'admin@synqai.sports'];

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
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAsGuest: () => void;
  loginWithToken: (token: string, plan: string, country: string) => void;
  register: (email: string, pass: string, name: string, clubName: string, plan?: 'free' | 'enterprise_scale') => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  completeOnboarding: (clubData: { name: string; id: string; country: string; sport: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
  loginWithToken: () => {},
  register: async () => {},
  login: async () => {},
  completeOnboarding: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de autenticación de Supabase
  useEffect(() => {
    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user);
        } else {
          // Intentar cargar del localStorage como fallback
          const savedProfile = localStorage.getItem("synq_profile");
          if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
          }
        }
      } catch (error) {
        console.error("[SynqAI] Error inicializando auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[SynqAI] Auth state changed:", event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        await loadUserProfile(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        localStorage.removeItem("synq_profile");
        localStorage.removeItem("synq_user");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cargar perfil del usuario desde Supabase
  const loadUserProfile = async (authUser: User) => {
    try {
      // Intentar obtener perfil de la tabla profiles
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("[SynqAI] Error cargando perfil:", error);
      }

      const emailLower = authUser.email?.toLowerCase() || '';
      const isAdmin = ADMIN_EMAILS.includes(emailLower);

      const userProfile: UserProfile = profileData ? {
        email: profileData.email || authUser.email || '',
        name: profileData.name || authUser.user_metadata?.name || 'Usuario SynqAI',
        role: profileData.role || (isAdmin ? 'superadmin' : 'promo_coach'),
        clubId: profileData.club_id || (isAdmin ? 'global-hq' : null),
        plan: profileData.plan || (isAdmin ? 'enterprise_scale' : 'free'),
        country: profileData.country || 'ES',
        sport: profileData.sport,
        clubCreated: profileData.club_created ?? isAdmin,
        clubName: profileData.club_name
      } : {
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'Usuario SynqAI',
        role: isAdmin ? 'superadmin' : 'promo_coach',
        clubId: isAdmin ? 'global-hq' : null,
        plan: isAdmin ? 'enterprise_scale' : 'free',
        country: 'ES',
        clubCreated: isAdmin,
      };

      setProfile(userProfile);
      localStorage.setItem("synq_profile", JSON.stringify(userProfile));
    } catch (error) {
      console.error("[SynqAI] Error en loadUserProfile:", error);
    }
  };

  const loginAsGuest = () => {
    const guestUser = { id: "synq-root-dev", email: "admin@synqai.sports" } as User;
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name,
          club_name: clubName,
          plan,
        }
      }
    });

    if (error) {
      console.error("[SynqAI] Error en registro:", error);
      throw new Error(error.message);
    }

    if (data.user) {
      const emailLower = email.toLowerCase();
      const isAdmin = ADMIN_EMAILS.includes(emailLower);

      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          name,
          role: isAdmin ? 'superadmin' : (plan === 'free' ? 'promo_coach' : 'club_admin'),
          club_id: isAdmin ? 'global-hq' : null,
          plan: isAdmin ? 'enterprise_scale' : plan,
          country: 'ES',
          club_created: isAdmin,
          club_name: clubName
        });

      if (profileError) {
        console.error("[SynqAI] Error creando perfil:", profileError);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      console.error("[SynqAI] Error en login:", error);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No se pudo autenticar el usuario");
    }

    // El perfil se cargará automáticamente por el listener de onAuthStateChange
  };

  const loginWithToken = (token: string, plan: any, country: string) => {
    const newUser = { id: `user-${Math.random().toString(36).substr(2, 9)}`, email: "pending@club.com" } as User;
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

  const completeOnboarding = async (clubData: { name: string; id: string; country: string; sport: string }) => {
    if (profile && user) {
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

      // Actualizar perfil en Supabase
      if (user.id && !user.id.startsWith('user-')) {
        await supabase
          .from('profiles')
          .update({
            club_id: clubData.id,
            club_name: clubData.name,
            country: clubData.country,
            sport: clubData.sport,
            club_created: true
          })
          .eq('id', user.id);
      }

      // Crear el club en la tabla clubs
      const { error: clubError } = await supabase
        .from('clubs')
        .insert({
          id: clubData.id,
          name: clubData.name,
          plan: profile.plan || 'free',
          users: 1,
          status: 'Active',
          country: clubData.country,
          sport: clubData.sport
        });

      if (clubError && clubError.code !== '23505') {
        console.error("[SynqAI] Error creando club:", clubError);
      }

      // Mantener compatibilidad con localStorage
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

      const existingGlobalUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
      const newUserEntry = {
        id: user.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        country: clubData.country,
        status: "Approved",
        clubId: clubData.id
      };
      localStorage.setItem("synq_global_users", JSON.stringify([...existingGlobalUsers, newUserEntry]));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem("synq_user");
    localStorage.removeItem("synq_profile");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, loginAsGuest, loginWithToken, register, login, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
