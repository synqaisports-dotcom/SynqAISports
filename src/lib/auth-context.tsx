"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n-config";

export type UserRole =
                  | "superadmin"
                  | "club_admin"
                  | "academy_director"
                  | "methodology_director"
                  | "stage_coordinator"
                  | "delegate"
                  | "coach"
                  | "promo_coach"
                  | "tutor"
                  | "athlete";

const ADMIN_EMAILS = ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com', 'admin@synqai.sports'];

function canUseFounderLoginUnsafeBypass() {
  const explicit = process.env.NEXT_PUBLIC_ENABLE_FOUNDER_LOGIN === "1";
  // Reactivación bajo control explícito por variable de entorno.
  return explicit;
}

function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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
  preferredLocale?: string;
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
  setPreferredLocale: (locale: string) => Promise<void>;
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
  setPreferredLocale: async () => {},
  logout: async () => {},
});

function normalizeLocale(input: string | null | undefined): string {
  const raw = String(input || "").toLowerCase().trim();
  const base = raw.split("-")[0] || DEFAULT_LOCALE;
  return AVAILABLE_LOCALES.some((l) => l.code === base) ? base : DEFAULT_LOCALE;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de autenticación de Supabase
  useEffect(() => {
    // Si Supabase no está configurado, usar modo demo
    if (!isSupabaseConfigured || !supabase) {
      const savedProfile = localStorage.getItem("synq_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      setLoading(false);
      return;
    }

    const client = supabase;

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await client.auth.getSession();
        
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
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, newSession) => {
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
    if (!supabase) return;
    
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
        role: (profileData.role || 'promo_coach') as UserRole,
        clubId: profileData.club_id || null,
        plan: profileData.plan || 'free',
        country: profileData.country || 'ES',
        sport: profileData.sport,
        clubCreated: profileData.club_created ?? false,
        clubName: profileData.club_name,
        preferredLocale: normalizeLocale(
          String(
            profileData.preferred_locale ??
            (authUser.user_metadata?.preferred_locale as string | undefined) ??
            ""
          ),
        ),
      } : {
        email: authUser.email || '',
        name: authUser.user_metadata?.name || 'Usuario SynqAI',
        role: 'promo_coach',
        clubId: null,
        plan: 'free',
        country: 'ES',
        clubCreated: false,
        preferredLocale: normalizeLocale(authUser.user_metadata?.preferred_locale as string | undefined),
      };

      setProfile(userProfile);
      localStorage.setItem("synq_profile", JSON.stringify(userProfile));
    } catch (error) {
      console.error("[SynqAI] Error en loadUserProfile:", error);
    }
  };

  const loginAsGuest = () => {
    if (!canUseFounderLoginUnsafeBypass()) {
      throw new Error("FOUNDER_LOGIN_DISABLED");
    }
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
      preferredLocale: DEFAULT_LOCALE,
    };
    
    setUser(guestUser);
    setProfile(guestProfile);
    
    localStorage.setItem("synq_user", JSON.stringify(guestUser));
    localStorage.setItem("synq_profile", JSON.stringify(guestProfile));
  };

  const register = async (email: string, pass: string, name: string, clubName: string, plan: 'free' | 'enterprise_scale' = 'free') => {
    if (!supabase) {
      throw new Error("Supabase no está configurado. Configure las variables de entorno.");
    }
    
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
      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          name,
          role: plan === 'free' ? 'promo_coach' : 'club_admin',
          club_id: null,
          plan,
          country: 'ES',
          club_created: false,
          club_name: clubName
        });

      if (profileError) {
        console.error("[SynqAI] Error creando perfil:", profileError);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    if (!supabase) {
      throw new Error("Supabase no está configurado. Configure las variables de entorno.");
    }
    
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
      claimedToken: token,
      preferredLocale: DEFAULT_LOCALE,
    };
    
    setUser(newUser);
    setProfile(newProfile);
    
    localStorage.setItem("synq_user", JSON.stringify(newUser));
    localStorage.setItem("synq_profile", JSON.stringify(newProfile));
  };

  const completeOnboarding = async (clubData: { name: string; id: string; country: string; sport: string }) => {
    if (profile && user) {
      if (!isUuidLike(clubData.id)) {
        console.error("[SynqAI] club_id inválido en onboarding:", clubData.id);
        throw new Error("CLUB_ID_INVALIDO");
      }
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

      // Actualizar perfil en Supabase (solo si está configurado)
      if (supabase && user.id && !user.id.startsWith('user-')) {
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

  const setPreferredLocale = async (locale: string) => {
    const normalized = normalizeLocale(locale);
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, preferredLocale: normalized };
      localStorage.setItem("synq_profile", JSON.stringify(next));
      return next;
    });

    if (supabase && user && !String(user.id).startsWith("user-")) {
      try {
        await supabase.auth.updateUser({
          data: { preferred_locale: normalized },
        });
      } catch {
        // fail-soft
      }
      try {
        await supabase
          .from("profiles")
          .update({ preferred_locale: normalized })
          .eq("id", user.id);
      } catch {
        // fail-soft: en entornos sin columna aún migrada
      }
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem("synq_user");
    localStorage.removeItem("synq_profile");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, loginAsGuest, loginWithToken, register, login, completeOnboarding, setPreferredLocale, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
