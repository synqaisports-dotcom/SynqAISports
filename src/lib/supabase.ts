import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SUPABASE_CLIENT_CONFIGURATION
 * Motor de sincronización para SynqAI Sports
 * Protocolo: Real-time Database + Auth
 */

// ============================================
// DATABASE TYPES - Tipado completo para Supabase
// ============================================

export type UserRole = 'superadmin' | 'club_admin' | 'coach' | 'promo_coach' | 'tutor' | 'athlete';
export type PlanType = 'free' | 'volumen_core' | 'enterprise_scale';
export type ClubStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';

export interface Club {
  id: string;
  name: string;
  plan: PlanType | string;
  users: number;
  status: ClubStatus | string;
  country: string;
  sport?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  club_id: string | null;
  plan: PlanType | null;
  country: string | null;
  sport?: string;
  club_created: boolean;
  club_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Athlete {
  id: string;
  name: string;
  email?: string;
  club_id: string;
  position?: string;
  jersey_number?: number;
  birth_date?: string;
  nationality?: string;
  status: 'active' | 'inactive' | 'injured';
  created_at?: string;
}

export interface Match {
  id: string;
  club_id: string;
  opponent: string;
  date: string;
  location?: string;
  result?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
}

// Tipo de base de datos completo para Supabase
export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: Club;
        Insert: Omit<Club, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Club, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      athletes: {
        Row: Athlete;
        Insert: Omit<Athlete, 'id' | 'created_at'>;
        Update: Partial<Omit<Athlete, 'id' | 'created_at'>>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, 'id' | 'created_at'>;
        Update: Partial<Omit<Match, 'id' | 'created_at'>>;
      };
    };
  };
}

// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag para verificar si Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn('[SynqAI] Variables de entorno de Supabase no configuradas. La app funcionará en modo demo.');
}

// Crear cliente tipado solo si está configurado
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verifica si el usuario actual tiene un rol específico
 */
export const hasRole = (profile: UserProfile | null, roles: UserRole[]): boolean => {
  if (!profile) return false;
  return roles.includes(profile.role);
};

/**
 * Verifica si el usuario es superadmin
 */
export const isSuperAdmin = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ['superadmin']);
};

/**
 * Verifica si el usuario puede administrar un club
 */
export const canManageClub = (profile: UserProfile | null): boolean => {
  return hasRole(profile, ['superadmin', 'club_admin']);
};

export default supabase;
