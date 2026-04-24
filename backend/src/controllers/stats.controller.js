import { convex, anyApi } from '../config/convex.js';

/**
 * Helper: Resolve Firebase UID → Convex user _id
 */
const getConvexUserId = async (firebaseUid) => {
  const user = await convex.query(anyApi.users.getUserByUid, { firebaseUid });
  if (!user) throw { status: 404, message: 'User not found in Convex' };
  return user._id;
};

// GET /stats  — dashboard stats for the authenticated user
export const getDashboardStats = async (req, res) => {
  try {
    const userId = await getConvexUserId(req.user.uid);
    const stats = await convex.query(anyApi.projects.getDashboardStats, { userId });

    res.json({
      totalProjects: parseInt(stats.totalProjects) || 0,
      totalAiPrompts: parseInt(stats.totalAiPrompts) || 0,
      starredProjects: parseInt(stats.starredProjects) || 0,
      totalFiles: parseInt(stats.totalFiles) || 0,
      totalDeployments: 0,
      totalLines: 0,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error.message || error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch dashboard stats" });
  }
};

// GET /stats/activity  — recent activity feed
export const getRecentActivity = async (req, res) => {
  try {
    const userId = await getConvexUserId(req.user.uid);
    const activities = await convex.query(anyApi.projects.getRecentActivity, { userId });

    const result = activities.map(a => ({
      type: a.type || 'project_created',
      message: `${a.type === 'project_created' ? 'Created project' : 'Updated project'}: ${a.title}`,
      time: new Date(a.timestamp).toISOString(),
      iconType: a.type === 'project_created' ? 'create' : 'update',
    }));

    res.json(result);
  } catch (error) {
    console.error("Recent Activity Error:", error.message || error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch recent activity" });
  }
};
