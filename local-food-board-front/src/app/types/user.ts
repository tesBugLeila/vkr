export interface IUser {
  id: string;
  phone: string;
  password: string | null;
  name: string | null;
  verified: boolean;
  role: 'user' | 'admin';
  isBlocked: boolean;
  notificationRadius: number;
  
  lastLat: number | null;
  lastLon: number | null;
  lastLocationUpdate: string | null;
  createdAt: string;
}

export interface IUserResp {
  token?: string;
  user: IUser;
}