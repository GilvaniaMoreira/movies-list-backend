export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}
