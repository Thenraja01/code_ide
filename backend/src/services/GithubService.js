import axios from 'axios';

/**
 * GitHub Service for repo management.
 */
export const createGitHubRepo = async (token, name, isPrivate = false) => {
  try {
    const response = await axios.post('https://api.github.com/user/repos', {
      name,
      private: isPrivate,
      auto_init: true
    }, {
      headers: { 
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (err) {
    console.error('GitHub Create Repo Error:', err.response?.data || err.message);
    throw err;
  }
};

export const pushToGitHub = async (token, owner, repo, branch, files) => {
    // 1. Get latest commit SHA
    // 2. Create blobs
    // 3. Create tree
    // 4. Create commit
    // 5. Update ref
    // (Simplified for MVP: User's logic will call this in Inngest background job)
    console.log(`Pushing to ${owner}/${repo} on branch ${branch}`);
};
