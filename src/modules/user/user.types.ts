export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}
