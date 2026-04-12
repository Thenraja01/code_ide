import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, fetchRecentActivity } from "../api/stats.api";

export const useStatsQuery = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
  });
};

export const useRecentActivityQuery = () => {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  });
};
