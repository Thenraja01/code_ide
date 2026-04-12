import { useQuery } from "@tanstack/react-query";
import { getUsers,type User } from "../api/auth.api";

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getUsers
  });
};
