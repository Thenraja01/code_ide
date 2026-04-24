import { convex, anyApi } from '../config/convex.js';

/**
 * Helper: Resolve Firebase UID → Convex user _id
 */
const getConvexUserId = async (firebaseUid) => {
  const user = await convex.query(anyApi.users.getUserByUid, { firebaseUid });
  if (!user) throw { status: 404, message: 'User not found in Convex. Please sync your account first.' };
  return user._id;
};

// GET /projects  — list all projects for the authenticated user (supports ?limit &page)
export const getProjects = async (req, res) => {
  try {
    const userId = await getConvexUserId(req.user.uid);
    const allProjects = await convex.query(anyApi.projects.getProjectsByUser, { userId });

    // Apply pagination
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const start = (page - 1) * limit;
    const paginated = allProjects.slice(start, start + limit);

    const projects = paginated.map(p => ({
      id: p._id,
      title: p.title,
      description: p.prompt || '',
      language: p.language,
      userId: p.userId,
      isStarred: p.isStarred || false,
      buildState: p.buildState || 'idle',
      createdAt: new Date(p._creationTime).toISOString(),
      updatedAt: new Date(p._creationTime).toISOString(),
    }));

    res.json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error.message || error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch projects" });
  }
};

// GET /projects/:id  — get a single project
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await convex.query(anyApi.projects.getProjectById, { projectId: id });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      id: project._id,
      title: project.title,
      description: project.prompt || '',
      language: project.language,
      userId: project.userId,
      isStarred: project.isStarred || false,
      buildState: project.buildState || 'idle',
      createdAt: new Date(project._creationTime).toISOString(),
      updatedAt: new Date(project._creationTime).toISOString(),
    });
  } catch (error) {
    console.error("Get Project Error:", error.message || error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// POST /projects  — create a new project
export const createProject = async (req, res) => {
  try {
    const { title, description, language } = req.body;
    const userId = await getConvexUserId(req.user.uid);

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const projectId = await convex.mutation(anyApi.projects.createProject, {
      title,
      language: language || 'javascript',
      userId,
      isPublic: false,
      prompt: description || '',
    });

    res.status(201).json({
      id: projectId,
      title,
      description: description || '',
      language: language || 'javascript',
      userId,
      isStarred: false,
      buildState: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Project Error:", error.message || error);
    res.status(error.status || 500).json({ error: error.message || "Failed to create project" });
  }
};

// DELETE /projects/:id  — delete a project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await convex.mutation(anyApi.projects.deleteProject, { projectId: id });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete Project Error:", error.message || error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// POST /projects/:id/initialize  — update build state to "generating"
export const initializeProject = async (req, res) => {
  try {
    const { id } = req.params;
    await convex.mutation(anyApi.projects.updateBuildState, {
      projectId: id,
      buildState: 'generating',
    });
    res.json({ message: "Project initialized successfully" });
  } catch (error) {
    console.error("Initialize Project Error:", error.message || error);
    res.status(500).json({ error: "Failed to initialize project" });
  }
};

// PATCH /projects/:id/star  — toggle star on a project
export const toggleStarProject = async (req, res) => {
  try {
    const { id } = req.params;
    await convex.mutation(anyApi.projects.toggleStar, { projectId: id });

    // Fetch updated project to return
    const project = await convex.query(anyApi.projects.getProjectById, { projectId: id });

    res.json({
      id: project._id,
      title: project.title,
      isStarred: project.isStarred || false,
    });
  } catch (error) {
    console.error("Toggle Star Error:", error.message || error);
    res.status(500).json({ error: "Failed to toggle star" });
  }
};
