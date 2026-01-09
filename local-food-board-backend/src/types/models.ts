export interface IUser {
  id: string;
  phone: string;
  password: string;
  name: string;
  email?: string | null;
  role: string;
  isBlocked: boolean;
  verified: boolean;
  createdAt: string;
}

export interface IUserRegisterRequest {
  phone: string;
  password: string;
  name: string;
  email?: string;
}

export interface IUserLoginRequest {
  phone: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    phone: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface IPost {
  id: string;
  title: string;
  description: string;
  price: number;
  contact: string;
  category: string;
  district: string;
  photos: string[];
  lat: number | null;
  lon: number | null;
  notifyNeighbors: boolean;
  userId: string;
  createdAt: string;
}

export interface IPostCreateRequest {
  title: string;
  description: string;
  price: number;
  contact: string;
  category?: string;
  district?: string;
  lat?: number;
  lon?: number;
  notifyNeighbors?: boolean;
}

export interface IPostUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  contact?: string;
  category?: string;
  district?: string;
  photos?: string[] | string;
  lat?: number;
  lon?: number;
  notifyNeighbors?: boolean;
}

export interface IReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  postId?: string | null;
  reason: string;
  description: string;
  status: string;
  adminComment?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface IPasswordReset {
  id: string;
  userId: string;
  code: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}