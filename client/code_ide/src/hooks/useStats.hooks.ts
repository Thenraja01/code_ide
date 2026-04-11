import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/stats.api";

export const useStatsQuery = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
  });
};
