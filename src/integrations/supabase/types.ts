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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          id: string
          identity_pub: string
          label: string
          last_seen_at: string
          safety_number: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          identity_pub: string
          label?: string
          last_seen_at?: string
          safety_number: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          identity_pub?: string
          label?: string
          last_seen_at?: string
          safety_number?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ciphertext: string
          conversation_id: string
          created_at: string
          envelope_id: string
          ephemeral_pub: string
          expires_at: string | null
          id: string
          iv: string
          recipient_device_id: string
          sender_device_id: string
          sender_id: string
        }
        Insert: {
          ciphertext: string
          conversation_id: string
          created_at?: string
          envelope_id: string
          ephemeral_pub: string
          expires_at?: string | null
          id?: string
          iv: string
          recipient_device_id: string
          sender_device_id: string
          sender_id: string
        }
        Update: {
          ciphertext?: string
          conversation_id?: string
          created_at?: string
          envelope_id?: string
          ephemeral_pub?: string
          expires_at?: string | null
          id?: string
          iv?: string
          recipient_device_id?: string
          sender_device_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_device_id_fkey"
            columns: ["recipient_device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_device_id_fkey"
            columns: ["sender_device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          comments: boolean
          likes: boolean
          messages: boolean
          show_previews: boolean
          subscriptions: boolean
          user_id: string
        }
        Insert: {
          comments?: boolean
          likes?: boolean
          messages?: boolean
          show_previews?: boolean
          subscriptions?: boolean
          user_id: string
        }
        Update: {
          comments?: boolean
          likes?: boolean
          messages?: boolean
          show_previews?: boolean
          subscriptions?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          conversation_id: string | null
          created_at: string
          id: string
          post_id: string | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_profile_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          caption: string
          category: string
          chain_id: string | null
          comment_count: number
          created_at: string
          duration_seconds: number | null
          height: number | null
          id: string
          kind: string
          like_count: number
          media_path: string
          thumb_path: string | null
          view_count: number
          visibility: string
          width: number | null
        }
        Insert: {
          author_id: string
          caption?: string
          category?: string
          chain_id?: string | null
          comment_count?: number
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind: string
          like_count?: number
          media_path: string
          thumb_path?: string | null
          view_count?: number
          visibility?: string
          width?: number | null
        }
        Update: {
          author_id?: string
          caption?: string
          category?: string
          chain_id?: string | null
          comment_count?: number
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind?: string
          like_count?: number
          media_path?: string
          thumb_path?: string | null
          view_count?: number
          visibility?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          handle: string
          hue: number
          id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          handle: string
          hue?: number
          id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          handle?: string
          hue?: number
          id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          creator_id: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          subscriber_id?: string
        }
        Relationships: []
      }
      vibe_chain_messages: {
        Row: {
          body: string
          chain_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          chain_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          chain_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vcm_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_messages_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_chain_nodes: {
        Row: {
          author_id: string
          body: string
          chain_id: string
          contribution: Database["public"]["Enums"]["contribution_type"]
          created_at: string
          id: string
          is_pinned: boolean
          link_url: string | null
          merged_from_node_id: string | null
          moderation_status: string
          original_author_id: string | null
          parent_id: string | null
          post_id: string | null
          remix_of_node_id: string | null
          updated_at: string
          vote_count: number
        }
        Insert: {
          author_id: string
          body?: string
          chain_id: string
          contribution?: Database["public"]["Enums"]["contribution_type"]
          created_at?: string
          id?: string
          is_pinned?: boolean
          link_url?: string | null
          merged_from_node_id?: string | null
          moderation_status?: string
          original_author_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          remix_of_node_id?: string | null
          updated_at?: string
          vote_count?: number
        }
        Update: {
          author_id?: string
          body?: string
          chain_id?: string
          contribution?: Database["public"]["Enums"]["contribution_type"]
          created_at?: string
          id?: string
          is_pinned?: boolean
          link_url?: string | null
          merged_from_node_id?: string | null
          moderation_status?: string
          original_author_id?: string | null
          parent_id?: string | null
          post_id?: string | null
          remix_of_node_id?: string | null
          updated_at?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "vcn_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_merged_from_node_id_fkey"
            columns: ["merged_from_node_id"]
            isOneToOne: false
            referencedRelation: "vibe_chain_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_original_author_id_fkey"
            columns: ["original_author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "vibe_chain_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_nodes_remix_of_node_id_fkey"
            columns: ["remix_of_node_id"]
            isOneToOne: false
            referencedRelation: "vibe_chain_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_chain_participants: {
        Row: {
          chain_id: string
          joined_at: string
          role: Database["public"]["Enums"]["chain_role"]
          user_id: string
        }
        Insert: {
          chain_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["chain_role"]
          user_id: string
        }
        Update: {
          chain_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["chain_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vcp_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_participants_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_chain_tasks: {
        Row: {
          assignee_id: string | null
          chain_id: string
          created_at: string
          created_by: string
          done: boolean
          due_date: string | null
          id: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          chain_id: string
          created_at?: string
          created_by: string
          done?: boolean
          due_date?: string | null
          id?: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          chain_id?: string
          created_at?: string
          created_by?: string
          done?: boolean
          due_date?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibe_chain_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_tasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_chain_votes: {
        Row: {
          chain_id: string
          created_at: string
          node_id: string
          user_id: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          node_id: string
          user_id: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibe_chain_votes_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "vibe_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chain_votes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "vibe_chain_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_chains: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          last_activity_at: string
          node_count: number
          participant_count: number
          result_summary: string
          root_post_id: string | null
          rules: string
          starter_id: string
          status: Database["public"]["Enums"]["chain_status"]
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["chain_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["chain_visibility"]
          vote_count: number
          voting_open: boolean
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          last_activity_at?: string
          node_count?: number
          participant_count?: number
          result_summary?: string
          root_post_id?: string | null
          rules?: string
          starter_id: string
          status?: Database["public"]["Enums"]["chain_status"]
          tags?: string[]
          title: string
          type?: Database["public"]["Enums"]["chain_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["chain_visibility"]
          vote_count?: number
          voting_open?: boolean
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          last_activity_at?: string
          node_count?: number
          participant_count?: number
          result_summary?: string
          root_post_id?: string | null
          rules?: string
          starter_id?: string
          status?: Database["public"]["Enums"]["chain_status"]
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["chain_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["chain_visibility"]
          vote_count?: number
          voting_open?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vibe_chains_root_post_id_fkey"
            columns: ["root_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vibe_chains_starter_profile_fkey"
            columns: ["starter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_contribute_chain: {
        Args: { _chain_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_chain: {
        Args: { _chain_id: string; _user_id: string }
        Returns: boolean
      }
      chain_role_of: {
        Args: { _chain_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["chain_role"]
      }
      is_chain_participant: {
        Args: { _chain_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      notify: {
        Args: {
          _actor: string
          _conversation: string
          _post: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      chain_role: "owner" | "moderator" | "editor" | "contributor"
      chain_status: "active" | "voting" | "building" | "complete" | "archived"
      chain_type:
        | "discussion"
        | "challenge"
        | "collaboration"
        | "remix"
        | "question"
        | "project"
        | "idea"
        | "open"
      chain_visibility: "public" | "followers" | "invite" | "private"
      contribution_type:
        | "response"
        | "remix"
        | "idea"
        | "improvement"
        | "question"
        | "design"
        | "collaboration"
        | "result"
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
      chain_role: ["owner", "moderator", "editor", "contributor"],
      chain_status: ["active", "voting", "building", "complete", "archived"],
      chain_type: [
        "discussion",
        "challenge",
        "collaboration",
        "remix",
        "question",
        "project",
        "idea",
        "open",
      ],
      chain_visibility: ["public", "followers", "invite", "private"],
      contribution_type: [
        "response",
        "remix",
        "idea",
        "improvement",
        "question",
        "design",
        "collaboration",
        "result",
      ],
    },
  },
} as const
