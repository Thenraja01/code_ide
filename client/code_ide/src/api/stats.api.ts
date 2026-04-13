import api from "./axios";

export interface DashboardStats {
  totalProjects: number;
  totalAiPrompts: number;
  starredProjects: number;
  totalFiles: number;
  totalDeployments?: number;
  totalLines?: number;
}

export interface RecentActivityItem {
  type: string;
  message: string;
  time: string;
  iconType: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/stats");
  return res.data;
};

export const fetchRecentActivity = async (): Promise<RecentActivityItem[]> => {
  const res = await api.get("/stats/activity");
  return res.data;
};
