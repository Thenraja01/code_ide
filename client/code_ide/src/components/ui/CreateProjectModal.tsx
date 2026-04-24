import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMeQuery } from '@/hooks/useAuth.hooks';

export default function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('react');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useMeQuery();
  
  const createProject = useMutation(api.projects.createProject);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Create Project in Convex (Idle State)
      const projectId = await createProject({
        title: name,
        language: framework,
        userId: user.id as any, // assuming Convex userId matches or requires mapping
        isPublic: false,
        prompt: prompt || undefined
      });

      // 2. Trigger Inngest AI flow on the Backend
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/project.create`, 
        { projectId, prompt, language: framework },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(e => console.error("AI trigger failed", e)); // We continue even if AI trigger fails for now

      onClose();
      // 3. User jumps to IDE, will see 'Generating...' UI
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] p-6 rounded-lg w-[32rem] text-white border border-[#333]">
        <h2 className="text-xl mb-4 font-semibold">Create New AI Project</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="project-title" className="block text-xs font-medium text-zinc-500 uppercase mb-1">
              Project Title
            </label>
            <input 
              id="project-title"
              name="title"
              type="text" 
              autoComplete="off"
              placeholder="e.g. My Awesome App" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#333] p-2 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-medium text-zinc-500 uppercase mb-1">
              What do you want to build?
            </label>
            <textarea
              id="project-desc"
              name="description"
              autoComplete="off"
              placeholder="Describe what you want to build (AI will generate the files)" 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-24 bg-[#2d2d2d] border border-[#333] p-2 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="project-framework" className="block text-xs font-medium text-zinc-500 uppercase mb-1">
              Framework / Language
            </label>
            <select 
              id="project-framework"
              name="framework"
              value={framework} 
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#333] p-2 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="react">React (Vite)</option>
              <option value="vue">vue</option>
              <option value="html">html</option>
              <option value="css">css</option>
              <option value="js">js</option>
              <option value="next">Next.js</option>
              <option value="node">Node.js</option>
              <option value="flask">Flask (Python)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
            {loading ? 'Creating...' : 'Initialize with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
