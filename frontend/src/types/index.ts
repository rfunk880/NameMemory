export interface User {
  id: number;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Group {
  id: number;
  name: string;
  owner_id: number;
  is_owner?: boolean;
  permission?: 'view' | 'edit';
  person_count?: number;
  owner_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: number;
  group_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
  suffix?: string | null;
  nickname?: string | null;
  description?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonFormData {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  nickname?: string;
  description?: string;
  notes?: string;
  photo?: File | null;
}

export interface GroupShare {
  id: number;
  group_id: number;
  shared_with_user_id: number;
  shared_by_user_id: number;
  permission: 'view' | 'edit';
  shared_at: string;
  name?: string;
  email?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
