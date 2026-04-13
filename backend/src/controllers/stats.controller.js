const prisma = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const totalProjects = await prisma.project.count({ where: { userId } });
    const totalAiPrompts = await prisma.aIPrompt.count({ where: { userId } });
    const starredProjects = await prisma.project.count({ where: { userId, isStarred: true } });
    const totalFiles = await prisma.file.count({ where: { project: { userId } } });

    res.json({
      totalProjects,
      totalAiPrompts,
      starredProjects,
      totalFiles,
      totalDeployments: 0,
      totalLines: totalFiles * 50
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const recentProjects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const recentAiPrompts = await prisma.aIPrompt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const activities = [
      ...recentProjects.map(p => ({
        type: 'project',
        message: `Created/Updated project "${p.title}"`,
        time: p.updatedAt,
        iconType: 'folder'
      })),
      ...recentAiPrompts.map(a => ({
        type: 'ai',
        message: `AI: ${a.prompt.substring(0, 30)}...`,
        time: a.createdAt,
        iconType: 'sparkles'
      }))
    ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent activity", details: error.message });
  }
};
