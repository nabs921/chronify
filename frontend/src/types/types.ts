export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
export interface Timeline {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public?: boolean;
  created_at: string;
}
export interface Media {
  name: string;
  source: {
    url: string;
  };
  type: "IMAGE" | "VIDEO";
}

export interface TimelineEvent {
  id?: string;
  title: string;
  card_title: string;
  card_subtitle?: string;
  card_detailed_text?: string;
  media?: Media;
}

export interface EventResponse {
  id: string;
  timeline_id: string;
  title: string;
  card_title: string;
  card_subtitle: string;
  card_detailed_text: string;
  media?: Media;
}
