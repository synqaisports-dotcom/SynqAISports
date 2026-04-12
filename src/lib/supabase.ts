import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SUPABASE_CLIENT_CONFIGURATION
 * Motor de sincronización para SynqAI Sports
 * Protocolo: Real-time Database + Auth
 */

// ============================================
// DATABASE TYPES - Tipado completo para Supabase
// ============================================

export type UserRole =
              | 'superadmin'
              | 'club_admin'
              | 'academy_director'
              | 'methodology_director'
              | 'stage_coordinator'
              | 'delegate'
              | 'coach'
              | 'promo_coach'
              | 'tutor'
              | 'athlete';
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
  /** Rol conocido o clave custom definida en `synq_roles`. */
  role: UserRole | string;
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

/** Fila `promo_campaigns` (magic links / QR, métricas B2B club). */
export interface PromoCampaign {
  id: string;
  title: string;
  token: string;
  plan_id: string | null;
  country_code: string;
  channel: string | null;
  periodicity: string | null;
  max_uses: number | null;
  scan_count: number;
  expires_at: string | null;
  is_active: boolean;
  hook: string | null;
  main_copy: string | null;
  created_at: string;
  updated_at: string;
}

/** Evento de escaneo vinculado a una campaña. */
export interface PromoCampaignEvent {
  id: string;
  campaign_id: string;
  kind: string;
  created_at: string;
}

export type MethodologyLibraryTaskStatus = 'Draft' | 'Official';

/** Fila `methodology_library_tasks` (Supabase). */
export interface MethodologyLibraryTaskRow {
  id: string;
  club_id: string;
  author_id: string | null;
  status: MethodologyLibraryTaskStatus;
  stage: string;
  dimension: string;
  title: string;
  author_name: string | null;
  didactic_strategy: string | null;
  objectives: string | null;
  conditional_content: string | null;
  time: string | null;
  space: string | null;
  game_situation: string | null;
  technical_action: string | null;
  tactical_action: string | null;
  collective_content: string | null;
  description: string | null;
  provocation_rules: string | null;
  instructions: string | null;
  equipment: string | null;
  photo_url: string | null;
  video_url: string | null;
  elements: unknown;
  board: Record<string, unknown>;
  board_coord_space: string;
  created_at: string;
  updated_at: string;
}

export type MethodologyLibraryTaskInsert = {
  club_id: string;
  author_id?: string | null;
  status?: MethodologyLibraryTaskStatus;
  stage: string;
  dimension?: string;
  title: string;
  author_name?: string | null;
  didactic_strategy?: string | null;
  objectives?: string | null;
  conditional_content?: string | null;
  time?: string | null;
  space?: string | null;
  game_situation?: string | null;
  technical_action?: string | null;
  tactical_action?: string | null;
  collective_content?: string | null;
  description?: string | null;
  provocation_rules?: string | null;
  instructions?: string | null;
  equipment?: string | null;
  photo_url?: string | null;
  video_url?: string | null;
  elements?: unknown;
  board?: Record<string, unknown>;
  board_coord_space?: string;
  id?: string;
};

/** Campos permitidos en PATCH (sin Partial; `DbUpdate` añade Record y opcionalidad). */
export type MethodologyLibraryTaskUpdateShape = {
  status: MethodologyLibraryTaskStatus;
  stage: string;
  dimension: string;
  title: string;
  author_name: string | null;
  didactic_strategy: string | null;
  objectives: string | null;
  conditional_content: string | null;
  time: string | null;
  space: string | null;
  game_situation: string | null;
  technical_action: string | null;
  tactical_action: string | null;
  collective_content: string | null;
  description: string | null;
  provocation_rules: string | null;
  instructions: string | null;
  equipment: string | null;
  photo_url: string | null;
  video_url: string | null;
  elements: unknown;
  board: Record<string, unknown>;
  board_coord_space: string;
  author_id: string | null;
  updated_at: string;
};

export type MethodologyLibraryTaskUpdate = Partial<MethodologyLibraryTaskUpdateShape>;

/**
 * PostgREST GenericTable exige Row/Insert/Update ⊆ Record<string, unknown>.
 * Con `strict`, `Partial<>` e interfaces puras no lo cumplen solas: el cliente
 * infiere Schema = never y todo `.from()` colapsa a `never`.
 */
type DbRow<T> = T & Record<string, unknown>;
type DbInsert<T> = T & Record<string, unknown>;
type DbUpdate<T> = Partial<T> & Record<string, unknown>;

// Tipo de base de datos completo para Supabase
export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: DbRow<Club>;
        /** `id` opcional en alta (UUID por defecto en Postgres / cliente). */
        Insert: DbInsert<Omit<Club, 'id' | 'created_at' | 'updated_at'> & { id?: string }>;
        Update: DbUpdate<Omit<Club, 'id' | 'created_at'>>;
        Relationships: [];
      };
      profiles: {
        Row: DbRow<UserProfile>;
        Insert: DbInsert<Omit<UserProfile, 'created_at' | 'updated_at'>>;
        Update: DbUpdate<Omit<UserProfile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      athletes: {
        Row: DbRow<Athlete>;
        Insert: DbInsert<Omit<Athlete, 'id' | 'created_at'>>;
        Update: DbUpdate<Omit<Athlete, 'id' | 'created_at'>>;
        Relationships: [];
      };
      matches: {
        Row: DbRow<Match>;
        Insert: DbInsert<Omit<Match, 'id' | 'created_at'>>;
        Update: DbUpdate<Omit<Match, 'id' | 'created_at'>>;
        Relationships: [];
      };
      /** Almacén ejercicios — filas mínimas para analytics/admin */
      exercises: {
        Row: DbRow<{
          id: string;
          club_id: string;
          author_id: string;
          title: string;
          stage?: string | null;
          dimension?: string | null;
          objective?: string | null;
          description?: string | null;
          payload_json: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        }>;
        Insert: DbInsert<{
          club_id: string;
          author_id: string;
          title: string;
          stage?: string | null;
          dimension?: string | null;
          objective?: string | null;
          description?: string | null;
          payload_json?: string | null;
          id?: string;
        }>;
        Update: DbUpdate<{
          title: string;
          stage: string | null;
          dimension: string | null;
          objective: string | null;
          description: string | null;
          payload_json: string | null;
        }>;
        Relationships: [];
      };
      promo_campaigns: {
        Row: DbRow<PromoCampaign>;
        Insert: DbInsert<{
          title: string;
          token: string;
          plan_id?: string | null;
          country_code?: string;
          channel?: string | null;
          periodicity?: string | null;
          max_uses?: number | null;
          scan_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          hook?: string | null;
          main_copy?: string | null;
          id?: string;
        }>;
        Update: DbUpdate<{
          title: string;
          token: string;
          plan_id: string | null;
          country_code: string;
          channel: string | null;
          periodicity: string | null;
          max_uses: number | null;
          scan_count: number;
          expires_at: string | null;
          is_active: boolean;
          hook: string | null;
          main_copy: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      promo_campaign_events: {
        Row: DbRow<PromoCampaignEvent>;
        Insert: DbInsert<{
          campaign_id: string;
          kind?: string;
          id?: string;
        }>;
        Update: DbUpdate<PromoCampaignEvent>;
        Relationships: [];
      };
      sandbox_collaboration_submissions: {
        Row: DbRow<{ submission_type: 'feedback' | 'lead' }>;
        Insert: DbInsert<{ submission_type: 'feedback' | 'lead' }>;
        Update: DbUpdate<{ submission_type: 'feedback' | 'lead' }>;
        Relationships: [];
      };
      ad_events_queue: {
        Row: DbRow<{
          id: string;
          event_id: string;
          event_type: string;
          event_ts: string;
          metadata: Record<string, unknown>;
          app: string;
          ingested_at: string;
        }>;
        Insert: DbInsert<{
          id?: string;
          event_id: string;
          event_type: string;
          event_ts: string;
          metadata?: Record<string, unknown>;
          app?: string;
          ingested_at?: string;
        }>;
        Update: DbUpdate<{
          event_id: string;
          event_type: string;
          event_ts: string;
          metadata: Record<string, unknown>;
          app: string;
          ingested_at: string;
        }>;
        Relationships: [];
      };
      sandbox_device_snapshots: {
        Row: DbRow<{
          id: string;
          device_id: string;
          app_scope: string;
          snapshot: Record<string, unknown>;
          created_at: string;
        }>;
        Insert: DbInsert<{
          id?: string;
          device_id: string;
          app_scope?: string;
          snapshot: Record<string, unknown>;
          created_at?: string;
        }>;
        Update: DbUpdate<{
          device_id: string;
          app_scope: string;
          snapshot: Record<string, unknown>;
          created_at: string;
        }>;
        Relationships: [];
      };
      synq_roles: {
        Row: DbRow<{
          key: string;
          label: string;
          description: string | null;
          is_system: boolean;
          permissions: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          key: string;
          label: string;
          description?: string | null;
          is_system?: boolean;
          permissions?: Record<string, unknown>;
        }>;
        Update: DbUpdate<{
          label: string;
          description: string | null;
          is_system: boolean;
          permissions: Record<string, unknown> | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      profile_roles: {
        Row: DbRow<{
          profile_id: string;
          role_key: string;
          created_at: string;
        }>;
        Insert: DbInsert<{
          profile_id: string;
          role_key: string;
        }>;
        Update: DbUpdate<{
          role_key: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      club_memberships: {
        Row: DbRow<{
          id: string;
          user_id: string;
          club_id: string;
          role_in_club: string;
          status: "active" | "pending" | "blocked";
          is_default: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          id?: string;
          user_id: string;
          club_id: string;
          role_in_club: string;
          status?: "active" | "pending" | "blocked";
          is_default?: boolean;
        }>;
        Update: DbUpdate<{
          role_in_club: string;
          status: "active" | "pending" | "blocked";
          is_default: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
      /** Biblioteca metodología (tarea maestra + pizarra); elements JSON 0–1 canvas campo. */
      methodology_library_tasks: {
        Row: DbRow<MethodologyLibraryTaskRow>;
        Insert: DbInsert<MethodologyLibraryTaskInsert>;
        Update: DbUpdate<MethodologyLibraryTaskUpdateShape>;
        Relationships: [];
      };
      methodology_session_assignments: {
        Row: DbRow<{
          id: string;
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          block_key: "warmup" | "central" | "cooldown";
          exercise_key: string | null;
          exercise_title: string;
          source: "planner" | "coach_approved" | "system";
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          block_key: "warmup" | "central" | "cooldown";
          exercise_key?: string | null;
          exercise_title: string;
          source?: "planner" | "coach_approved" | "system";
          updated_by?: string | null;
          id?: string;
        }>;
        Update: DbUpdate<{
          exercise_key: string | null;
          exercise_title: string;
          source: "planner" | "coach_approved" | "system";
          updated_by: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      methodology_change_requests: {
        Row: DbRow<{
          id: string;
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          block_key: "warmup" | "central" | "cooldown";
          original_exercise_key: string | null;
          original_exercise: string;
          proposed_exercise_key: string | null;
          proposed_exercise: string;
          reason: string;
          status: "Pending" | "Approved" | "Denied";
          coach_id: string | null;
          coach_name: string | null;
          director_id: string | null;
          director_comment: string | null;
          processed_at: string | null;
          created_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          block_key: "warmup" | "central" | "cooldown";
          original_exercise_key?: string | null;
          original_exercise: string;
          proposed_exercise_key?: string | null;
          proposed_exercise: string;
          reason: string;
          status?: "Pending" | "Approved" | "Denied";
          coach_id?: string | null;
          coach_name?: string | null;
          director_id?: string | null;
          director_comment?: string | null;
          processed_at?: string | null;
          id?: string;
        }>;
        Update: DbUpdate<{
          proposed_exercise_key: string | null;
          proposed_exercise: string;
          reason: string;
          status: "Pending" | "Approved" | "Denied";
          director_id: string | null;
          director_comment: string | null;
          processed_at: string | null;
        }>;
        Relationships: [];
      };
      methodology_session_attendance: {
        Row: DbRow<{
          id: string;
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          player_id: string;
          status: "present" | "absent" | "late";
          updated_by: string | null;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          team_id: string;
          mcc: string;
          session: string;
          player_id: string;
          status: "present" | "absent" | "late";
          updated_by?: string | null;
          id?: string;
        }>;
        Update: DbUpdate<{
          status: "present" | "absent" | "late";
          updated_by: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
      methodology_academy_state: {
        Row: DbRow<{
          club_id: string;
          payload: unknown;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          payload?: unknown;
          updated_at?: string;
        }>;
        Update: DbUpdate<{
          payload: unknown;
          updated_at: string;
        }>;
        Relationships: [];
      };
      methodology_warehouse_state: {
        Row: DbRow<{
          club_id: string;
          payload: unknown;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          payload?: unknown;
          updated_at?: string;
        }>;
        Update: DbUpdate<{
          payload: unknown;
          updated_at: string;
        }>;
        Relationships: [];
      };
      club_staff_access_matrices: {
        Row: DbRow<{
          club_id: string;
          payload: unknown;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          payload?: unknown;
          updated_at?: string;
        }>;
        Update: DbUpdate<{
          payload: unknown;
          updated_at: string;
        }>;
        Relationships: [];
      };
      global_plans: {
        Row: DbRow<{
          id: string;
          title: string;
          price_per_node: string | null;
          min_nodes: string | null;
          features: unknown;
          access: unknown;
          default_role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          id: string;
          title: string;
          price_per_node?: string | null;
          min_nodes?: string | null;
          features?: unknown;
          access?: unknown;
          default_role?: string;
          is_active?: boolean;
        }>;
        Update: DbUpdate<{
          title: string;
          price_per_node: string | null;
          min_nodes: string | null;
          features: unknown;
          access: unknown;
          default_role: string;
          is_active: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
      admin_user_states: {
        Row: DbRow<{
          profile_id: string;
          status: "Pending" | "Approved" | "Denied";
          last_seen: string;
          updated_at: string;
        }>;
        Insert: DbInsert<{
          profile_id: string;
          status?: "Pending" | "Approved" | "Denied";
          last_seen?: string;
        }>;
        Update: DbUpdate<{
          status: "Pending" | "Approved" | "Denied";
          last_seen: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      admin_audit_logs: {
        Row: DbRow<{
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          title: string;
          description: string;
          type: "Success" | "Info" | "Warning";
          created_at: string;
        }>;
        Insert: DbInsert<{
          actor_id?: string | null;
          actor_email?: string | null;
          title: string;
          description: string;
          type?: "Success" | "Info" | "Warning";
        }>;
        Update: DbUpdate<{
          actor_id: string | null;
          actor_email: string | null;
          title: string;
          description: string;
          type: "Success" | "Info" | "Warning";
        }>;
        Relationships: [];
      };
      operativa_mobile_incidents: {
        Row: DbRow<{
          id: string;
          club_id: string;
          actor_id: string | null;
          team_id: string;
          mcc: string;
          session: string;
          incident_id: string;
          incident_label: string;
          score_home: number;
          score_guest: number;
          remaining_sec: number;
          source: string;
          created_at: string;
        }>;
        Insert: DbInsert<{
          club_id: string;
          actor_id?: string | null;
          team_id: string;
          mcc: string;
          session: string;
          incident_id: string;
          incident_label: string;
          score_home?: number;
          score_guest?: number;
          remaining_sec?: number;
          source?: string;
        }>;
        Update: DbUpdate<{
          score_home: number;
          score_guest: number;
          remaining_sec: number;
          source: string;
        }>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_promo_scan: {
        Args: { p_token: string } & Record<string, unknown>;
        Returns: Record<string, unknown>;
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
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
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
  return roles.includes(profile.role as UserRole);
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
