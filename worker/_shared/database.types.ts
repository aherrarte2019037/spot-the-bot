export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      game_players: {
        Row: {
          bot_personality: Database["public"]["Enums"]["bot_personality"]
          created_at: string
          game_id: number | null
          id: number
          is_bot: boolean | null
          profile_id: string | null
          score: number | null
        }
        Insert: {
          bot_personality?: Database["public"]["Enums"]["bot_personality"]
          created_at?: string
          game_id?: number | null
          id?: number
          is_bot?: boolean | null
          profile_id?: string | null
          score?: number | null
        }
        Update: {
          bot_personality?: Database["public"]["Enums"]["bot_personality"]
          created_at?: string
          game_id?: number | null
          id?: number
          is_bot?: boolean | null
          profile_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          bot_count: number
          bot_player_ids: string[] | null
          chat_duration: number | null
          created_at: string
          ended_at: string | null
          id: number
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["game_status"]
          topic: string
          topic_id: number | null
          updated_at: string | null
        }
        Insert: {
          bot_count?: number
          bot_player_ids?: string[] | null
          chat_duration?: number | null
          created_at?: string
          ended_at?: string | null
          id?: number
          max_players?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          topic: string
          topic_id?: number | null
          updated_at?: string | null
        }
        Update: {
          bot_count?: number
          bot_player_ids?: string[] | null
          chat_duration?: number | null
          created_at?: string
          ended_at?: string | null
          id?: number
          max_players?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["game_status"]
          topic?: string
          topic_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          game_id: number
          id: number
          is_bot: boolean
          player_id: number
        }
        Insert: {
          content: string
          created_at?: string
          game_id: number
          id?: number
          is_bot?: boolean
          player_id: number
        }
        Update: {
          content?: string
          created_at?: string
          game_id?: number
          id?: number
          is_bot?: boolean
          player_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "messages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          created_at: string
          email: string
          games_played: number
          games_won: number
          id: string
          level: number
          onboarding_complete: boolean
          updated_at: string
          user_name: string
          xp: number
        }
        Insert: {
          avatar_url: string
          created_at?: string
          email: string
          games_played?: number
          games_won?: number
          id: string
          level?: number
          onboarding_complete?: boolean
          updated_at?: string
          user_name: string
          xp?: number
        }
        Update: {
          avatar_url?: string
          created_at?: string
          email?: string
          games_played?: number
          games_won?: number
          id?: string
          level?: number
          onboarding_complete?: boolean
          updated_at?: string
          user_name?: string
          xp?: number
        }
        Relationships: []
      }
      topics: {
        Row: {
          category: Database["public"]["Enums"]["topic_category"]
          created_at: string
          id: number
          topic: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["topic_category"]
          created_at?: string
          id?: number
          topic: string
        }
        Update: {
          category?: Database["public"]["Enums"]["topic_category"]
          created_at?: string
          id?: number
          topic?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          game_id: number | null
          id: number
          target_id: number | null
          voter_id: number | null
        }
        Insert: {
          created_at?: string
          game_id?: number | null
          id?: number
          target_id?: number | null
          voter_id?: number | null
        }
        Update: {
          created_at?: string
          game_id?: number | null
          id?: number
          target_id?: number | null
          voter_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      get_random_topic: {
        Args: never
        Returns: {
          category: Database["public"]["Enums"]["topic_category"]
          created_at: string
          id: number
          topic: string
        }[]
        SetofOptions: {
          from: "*"
          to: "topics"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      bot_personality: "none" | "casual" | "formal" | "quirky"
      game_status: "none" | "waiting" | "chatting" | "voting" | "completed"
      topic_category: "default"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
export type TablesRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type GameStatus = Database["public"]["Enums"]["game_status"]

