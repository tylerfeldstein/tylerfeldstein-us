export interface JWTPayload {
  userId: string;
  userRole: string;
  exp: number;
  iat: number;
  jti: string;
} 