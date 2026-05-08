export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contributors: {
        Row: {
          avatar_url: string | null
          bio: string
          color: string
          created_at: string
          display_name: string
          handle: string
          initials: string
          palate: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio: string
          color: string
          created_at?: string
          display_name: string
          handle: string
          initials: string
          palate: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          color?: string
          created_at?: string
          display_name?: string
          handle?: string
          initials?: string
          palate?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string
          body: string | null
          cat: Database["public"]["Enums"]["post_category"]
          created_at: string
          date: string
          excerpt: string
          grad: string
          image_url: string | null
          published: boolean
          published_at: string | null
          read_time: number
          related: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          body?: string | null
          cat: Database["public"]["Enums"]["post_category"]
          created_at?: string
          date: string
          excerpt: string
          grad: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          read_time: number
          related?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body?: string | null
          cat?: Database["public"]["Enums"]["post_category"]
          created_at?: string
          date?: string
          excerpt?: string
          grad?: string
          image_url?: string | null
          published?: boolean
          published_at?: string | null
          read_time?: number
          related?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          id: string
          path: string
          referrer_host: string | null
          ua_class: string | null
          viewed_at: string
        }
        Insert: {
          country?: string | null
          id?: string
          path: string
          referrer_host?: string | null
          ua_class?: string | null
          viewed_at?: string
        }
        Update: {
          country?: string | null
          id?: string
          path?: string
          referrer_host?: string | null
          ua_class?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      vendor_clicks: {
        Row: {
          clicked_at: string
          country: string | null
          id: string
          referrer_host: string | null
          source_path: string | null
          ua_class: string | null
          vendor_slug: string
        }
        Insert: {
          clicked_at?: string
          country?: string | null
          id?: string
          referrer_host?: string | null
          source_path?: string | null
          ua_class?: string | null
          vendor_slug: string
        }
        Update: {
          clicked_at?: string
          country?: string | null
          id?: string
          referrer_host?: string | null
          source_path?: string | null
          ua_class?: string | null
          vendor_slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aligned: string
          avatar_url: string | null
          composite: boolean
          contributor_handle: string | null
          created_at: string
          display_name: string | null
          email: string | null
          flavor_mode: string
          id: string
          notifications: Json
          role: Database["public"]["Enums"]["user_role"]
          tasted_teas: string[]
          theme: string
          updated_at: string
        }
        Insert: {
          aligned?: string
          avatar_url?: string | null
          composite?: boolean
          contributor_handle?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          flavor_mode?: string
          id: string
          notifications?: Json
          role?: Database["public"]["Enums"]["user_role"]
          tasted_teas?: string[]
          theme?: string
          updated_at?: string
        }
        Update: {
          aligned?: string
          avatar_url?: string | null
          composite?: boolean
          contributor_handle?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          flavor_mode?: string
          id?: string
          notifications?: Json
          role?: Database["public"]["Enums"]["user_role"]
          tasted_teas?: string[]
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          body: string | null
          brew_style_override: string | null
          brewed_at: string
          created_at: string
          id: string
          leaf_g: number | null
          mode: string
          mouthfeel: Json | null
          profile: Json | null
          rating: number | null
          scale: string
          share_enabled: boolean
          share_token: string | null
          steeps: Json | null
          user_id: string
          user_tea_id: string
          user_teaware_id: string | null
          vessel: string | null
          water: string | null
          water_ml: number | null
          water_source: string | null
          water_tds_ppm: number | null
        }
        Insert: {
          body?: string | null
          brew_style_override?: string | null
          brewed_at?: string
          created_at?: string
          id?: string
          leaf_g?: number | null
          mode?: string
          mouthfeel?: Json | null
          profile?: Json | null
          rating?: number | null
          scale?: string
          share_enabled?: boolean
          share_token?: string | null
          steeps?: Json | null
          user_id: string
          user_tea_id: string
          user_teaware_id?: string | null
          vessel?: string | null
          water?: string | null
          water_ml?: number | null
          water_source?: string | null
          water_tds_ppm?: number | null
        }
        Update: {
          body?: string | null
          brew_style_override?: string | null
          brewed_at?: string
          created_at?: string
          id?: string
          leaf_g?: number | null
          mode?: string
          mouthfeel?: Json | null
          profile?: Json | null
          rating?: number | null
          scale?: string
          share_enabled?: boolean
          share_token?: string | null
          steeps?: Json | null
          user_id?: string
          user_tea_id?: string
          user_teaware_id?: string | null
          vessel?: string | null
          water?: string | null
          water_ml?: number | null
          water_source?: string | null
          water_tds_ppm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "contributor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_tea_id_fkey"
            columns: ["user_tea_id"]
            isOneToOne: false
            referencedRelation: "user_teas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_teaware_id_fkey"
            columns: ["user_teaware_id"]
            isOneToOne: false
            referencedRelation: "user_teaware"
            referencedColumns: ["id"]
          },
        ]
      }
      teas: {
        Row: {
          age: string
          aged: boolean
          brewing: Json
          chinese: string | null
          country: string
          created_at: string
          elev: number
          finish: string[]
          flavor: Json
          gradient: string
          harvest: string
          image_url: string | null
          mouthfeel: Json
          name: string
          path_slug: string
          peak_steeps: number[]
          price: number
          published: boolean
          rarity: number
          region: string
          reviews: Json
          sessions_count: number
          slug: string
          subtitle: string | null
          subtype: string | null
          summary: string
          swatch: string
          type: Database["public"]["Enums"]["tea_type"]
          updated_at: string
          vendor_slug: string
          year: string
        }
        Insert: {
          age: string
          aged?: boolean
          brewing: Json
          chinese?: string | null
          country: string
          created_at?: string
          elev: number
          finish?: string[]
          flavor: Json
          gradient: string
          harvest: string
          image_url?: string | null
          mouthfeel: Json
          name: string
          path_slug: string
          peak_steeps?: number[]
          price: number
          published?: boolean
          rarity: number
          region: string
          reviews: Json
          sessions_count?: number
          slug: string
          subtitle?: string | null
          subtype?: string | null
          summary: string
          swatch: string
          type: Database["public"]["Enums"]["tea_type"]
          updated_at?: string
          vendor_slug: string
          year: string
        }
        Update: {
          age?: string
          aged?: boolean
          brewing?: Json
          chinese?: string | null
          country?: string
          created_at?: string
          elev?: number
          finish?: string[]
          flavor?: Json
          gradient?: string
          harvest?: string
          image_url?: string | null
          mouthfeel?: Json
          name?: string
          path_slug?: string
          peak_steeps?: number[]
          price?: number
          published?: boolean
          rarity?: number
          region?: string
          reviews?: Json
          sessions_count?: number
          slug?: string
          subtitle?: string | null
          subtype?: string | null
          summary?: string
          swatch?: string
          type?: Database["public"]["Enums"]["tea_type"]
          updated_at?: string
          vendor_slug?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "teas_vendor_slug_fkey"
            columns: ["vendor_slug"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["slug"]
          },
        ]
      }
      teaware: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["teaware_category"]
          created_at: string
          external_url: string | null
          good_for: string[]
          gradient: string
          image_url: string | null
          material: string
          name: string
          origin: string | null
          price: number
          published: boolean
          rating: number
          slug: string
          swatch: string
          tagline: string
          updated_at: string
          vendor: string
          volume_ml: number | null
        }
        Insert: {
          body: string
          category: Database["public"]["Enums"]["teaware_category"]
          created_at?: string
          external_url?: string | null
          good_for?: string[]
          gradient: string
          image_url?: string | null
          material: string
          name: string
          origin?: string | null
          price: number
          published?: boolean
          rating: number
          slug: string
          swatch: string
          tagline: string
          updated_at?: string
          vendor: string
          volume_ml?: number | null
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["teaware_category"]
          created_at?: string
          external_url?: string | null
          good_for?: string[]
          gradient?: string
          image_url?: string | null
          material?: string
          name?: string
          origin?: string | null
          price?: number
          published?: boolean
          rating?: number
          slug?: string
          swatch?: string
          tagline?: string
          updated_at?: string
          vendor?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      user_teas: {
        Row: {
          added_at: string
          custom_name: string | null
          custom_type: string | null
          custom_vendor: string | null
          custom_year: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["user_tea_status"]
          tea_slug: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          custom_name?: string | null
          custom_type?: string | null
          custom_vendor?: string | null
          custom_year?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["user_tea_status"]
          tea_slug?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          custom_name?: string | null
          custom_type?: string | null
          custom_vendor?: string | null
          custom_year?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["user_tea_status"]
          tea_slug?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_teas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "contributor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teaware: {
        Row: {
          added_at: string
          custom_material: string | null
          custom_name: string | null
          custom_volume_ml: number | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["user_teaware_status"]
          teaware_slug: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          custom_material?: string | null
          custom_name?: string | null
          custom_volume_ml?: number | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["user_teaware_status"]
          teaware_slug?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          custom_material?: string | null
          custom_name?: string | null
          custom_volume_ml?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["user_teaware_status"]
          teaware_slug?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_teaware_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "contributor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teaware_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          body: string
          city: string
          continent: string
          country: string
          created_at: string
          founded: number
          image_url: string | null
          name: string
          owner_id: string | null
          published: boolean
          rating: number
          slug: string
          specialties: string[]
          swatch: string
          tagline: string
          tea_count: number
          updated_at: string
          url: string
        }
        Insert: {
          body: string
          city: string
          continent: string
          country: string
          created_at?: string
          founded: number
          image_url?: string | null
          name: string
          owner_id?: string | null
          published?: boolean
          rating: number
          slug: string
          specialties?: string[]
          swatch: string
          tagline: string
          tea_count?: number
          updated_at?: string
          url: string
        }
        Update: {
          body?: string
          city?: string
          continent?: string
          country?: string
          created_at?: string
          founded?: number
          image_url?: string | null
          name?: string
          owner_id?: string | null
          published?: boolean
          rating?: number
          slug?: string
          specialties?: string[]
          swatch?: string
          tagline?: string
          tea_count?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "contributor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contributor_profiles: {
        Row: {
          aligned: string | null
          contributor_handle: string | null
          display_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          aligned?: string | null
          contributor_handle?: string | null
          display_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          aligned?: string | null
          contributor_handle?: string | null
          display_name?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_staff: { Args: { uid: string }; Returns: boolean }
      owns_teaware_vendor: {
        Args: { uid: string; vendor_name: string }
        Returns: boolean
      }
    }
    Enums: {
      post_category: "Brewing" | "Culture" | "Origin" | "Vendor Spotlight"
      tea_type:
        | "Green"
        | "White"
        | "Yellow"
        | "Oolong"
        | "Black"
        | "Sheng Pu'er"
        | "Shou Pu'er"
        | "Dark"
        | "Herbal"
      teaware_category:
        | "Gaiwan"
        | "Teapot"
        | "Kyusu"
        | "Pitcher"
        | "Cup"
        | "Kettle"
        | "Scale"
        | "Strainer"
        | "Other"
      user_role: "admin" | "contributor" | "vendor" | "member" | "user"
      user_tea_status: "wishlist" | "owned" | "tried" | "retired"
      user_teaware_status: "wishlist" | "owned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      post_category: ["Brewing", "Culture", "Origin", "Vendor Spotlight"],
      tea_type: [
        "Green",
        "White",
        "Yellow",
        "Oolong",
        "Black",
        "Sheng Pu'er",
        "Shou Pu'er",
        "Dark",
        "Herbal",
      ],
      teaware_category: [
        "Gaiwan",
        "Teapot",
        "Kyusu",
        "Pitcher",
        "Cup",
        "Kettle",
        "Scale",
        "Strainer",
        "Other",
      ],
      user_role: ["admin", "contributor", "vendor", "member", "user"],
      user_tea_status: ["wishlist", "owned", "tried", "retired"],
      user_teaware_status: ["wishlist", "owned"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const


// =====================================================================
// Convenience aliases - keep importers stable across gen-types runs.
// =====================================================================
export type UserRole = Database["public"]["Enums"]["user_role"];
export type UserTeaStatus = Database["public"]["Enums"]["user_tea_status"];
export type UserTeawareStatus = Database["public"]["Enums"]["user_teaware_status"];
export type TeaTypeEnum = Database["public"]["Enums"]["tea_type"];
export type TeawareCategoryEnum = Database["public"]["Enums"]["teaware_category"];
export type PostCategoryEnum = Database["public"]["Enums"]["post_category"];

