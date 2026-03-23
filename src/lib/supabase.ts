import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE_CLIENT_CONFIGURATION
 * Motor de sincronización para SynqAI Sports
 * Protocolo: Real-time Database + Auth
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SynqAI] Variables de entorno de Supabase no configuradas. Por favor configure NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos para la base de datos
export interface Club {
  id: string;
  name: string;
  plan: string;
  users: number;
  status: string;
  country: string;
  sport?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'club_admin' | 'coach' | 'promo_coach' | 'tutor' | 'athlete';
  club_id: string | null;
  plan: 'free' | 'volumen_core' | 'enterprise_scale' | null;
  country: string | null;
  sport?: string;
  club_created: boolean;
  club_name?: string;
  created_at?: string;
}

export default supabase;
