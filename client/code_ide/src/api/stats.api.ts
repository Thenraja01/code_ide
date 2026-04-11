import api from "./axios";

export interface DashboardStats {
  totalProjects: number;
  starredProjects: number;
  totalLines: number;
  totalDeployments: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get("/stats");
  return res.data;
};
