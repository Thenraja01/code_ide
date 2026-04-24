import api from "./axios";

export interface AuthResponse {
  token: string;
}
export interface User {
  id: string;
  name?: string;
  email: string;
  provider: string;
}
export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleInput {
  idToken: string;
}

export const registerUser = async (
  data: RegisterInput
): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (
  data: LoginInput
): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const googleAuth = async (
  data: GoogleInput
): Promise<AuthResponse> => {
  const res = await api.post("/auth/google", data);
  return res.data;
};

export const githubAuth = async (
  data: { idToken: string }
): Promise<AuthResponse> => {
  const res = await api.post("/auth/github", data);
  return res.data;
};

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get("/auth/users");
  return res.data;
};
export const getMe = async (): Promise<User> => {
  const res = await api.get("/auth/me");
  return res.data;
};
