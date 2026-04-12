import { useMutation } from "@tanstack/react-query";
import { googleAuth, type GoogleInput } from "../api/auth.api";

export const useGoogleLogin = (options?: any) => {
  return useMutation({
    mutationKey: ['google-login'],
    mutationFn: (data: GoogleInput) => googleAuth(data),
    ...options
  });
};
