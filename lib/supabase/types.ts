// Generated TypeScript schema for the Supabase database.
//
// This file is normally produced by:
//
//   supabase gen types typescript --local > lib/supabase/types.ts
//
// (or `--linked` against the hosted project). Until the local stack is
// running and migrations have been applied, we ship this hand-written
// placeholder so the typed clients in lib/supabase/{client,server,admin}.ts
// compile against a known shape.
//
// Once `supabase start` + `supabase db reset` have applied the initial
// migration, run the gen-types command to overwrite this file with the
// real schema. The columns/tables below should match supabase/migrations/
// — keep them in sync until the codegen takes over.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "contributor" | "vendor" | "member" | "user";
export type UserTeaStatus = "wishlist" | "owned" | "tried" | "retired";
export type UserTeawareStatus = "wishlist" | "owned";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          role: UserRole;
          contributor_handle: string | null;
          flavor_mode: "blind" | "basic" | "advanced";
          composite: boolean;
          theme: string;
          aligned: "vivek" | "james";
          notifications: Json;
          tasted_teas: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      user_teas: {
        Row: {
          id: string;
          user_id: string;
          status: UserTeaStatus;
          tea_slug: string | null;
          custom_name: string | null;
          custom_vendor: string | null;
          custom_year: string | null;
          custom_type: string | null;
          notes: string | null;
          added_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_teas"]["Row"]> & {
          user_id: string;
          status: UserTeaStatus;
        };
        Update: Partial<Database["public"]["Tables"]["user_teas"]["Row"]>;
      };
      user_teaware: {
        Row: {
          id: string;
          user_id: string;
          status: UserTeawareStatus;
          teaware_slug: string | null;
          custom_name: string | null;
          custom_material: string | null;
          custom_volume_ml: number | null;
          notes: string | null;
          added_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_teaware"]["Row"]> & {
          user_id: string;
          status: UserTeawareStatus;
        };
        Update: Partial<Database["public"]["Tables"]["user_teaware"]["Row"]>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          user_tea_id: string;
          user_teaware_id: string | null;
          rating: number | null;
          body: string | null;
          scale: "basic" | "advanced";
          mode: "quick" | "per-steep";
          profile: Json | null;
          mouthfeel: Json | null;
          steeps: Json | null;
          vessel: string | null;
          water: string | null;
          water_source: string | null;
          water_tds_ppm: number | null;
          brew_style_override: string | null;
          leaf_g: number | null;
          water_ml: number | null;
          brewed_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sessions"]["Row"]> & {
          user_id: string;
          user_tea_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
      };
    };
    Views: { [key: string]: never };
    Functions: { [key: string]: never };
    Enums: {
      user_role: UserRole;
      user_tea_status: UserTeaStatus;
      user_teaware_status: UserTeawareStatus;
    };
  };
};
