export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    children_info: Json | null
                    created_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    children_info?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    children_info?: Json | null
                    created_at?: string
                }
                Relationships: []
            }
            artworks: {
                Row: {
                    id: string
                    user_id: string
                    storage_path: string
                    created_at: string
                    shot_at_date: string | null
                    age_at_creation: string | null
                    child_id: string | null
                    memo: string | null
                    tags: string[] | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    storage_path: string
                    created_at?: string
                    shot_at_date?: string | null
                    age_at_creation?: string | null
                    memo?: string | null
                    tags?: string[] | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    storage_path?: string
                    created_at?: string
                    shot_at_date?: string | null
                    age_at_creation?: string | null
                    memo?: string | null
                    tags?: string[] | null
                }
                Relationships: []
            }
            share_links: {
                Row: {
                    token: string
                    user_id: string
                    label: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    token: string
                    user_id: string
                    label?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    token?: string
                    user_id?: string
                    label?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            children: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    birth_date: string | null
                    color: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    birth_date?: string | null
                    color?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    birth_date?: string | null
                    color?: string
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_shared_artworks: {
                Args: {
                    share_token: string
                }
                Returns: {
                    id: string
                    user_id: string
                    storage_path: string
                    created_at: string
                    shot_at_date: string | null
                    age_at_creation: string | null
                    child_id: string | null
                    memo: string | null
                    tags: string[] | null
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
