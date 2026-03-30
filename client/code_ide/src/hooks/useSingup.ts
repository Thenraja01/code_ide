import { useMutation,type UseMutationOptions } from "@tanstack/react-query";
import {
  registerUser,
  type RegisterInput,
  type AuthResponse
} from "../api/auth.api";

export const useRegister = (
  options?: UseMutationOptions<AuthResponse, any, RegisterInput>
) => {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: registerUser,
    ...options,
  });
};
