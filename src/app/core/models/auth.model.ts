export interface LoginRequest {
  readonly username: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly token: string;
}

export interface UserResponse {
  readonly uuid: string;
  readonly username: string;
}
