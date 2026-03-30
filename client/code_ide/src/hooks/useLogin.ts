import { useMutation } from "@tanstack/react-query";
import api from "../api/axios";

type LoginData = {
  email: string
  password: string
}

export const useLogin = (options?: any) => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (data: LoginData) => {
      const res = await api.post('/login', data);
      return res.data;
    },
    ...options
  })
}
