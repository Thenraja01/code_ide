import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [framework, setFramework] = useState('react');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, 
        { name, title: name, framework },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose();
      navigate(`/project/${res.data.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] p-6 rounded-lg w-96 text-white border border-[#333]">
        <h2 className="text-xl mb-4 font-semibold">Create New Project</h2>
        <input 
          type="text" 
          placeholder="Project Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#333] p-2 rounded mb-4 focus:outline-none focus:border-blue-500"
        />
        <select 
          value={framework} 
          onChange={(e) => setFramework(e.target.value)}
          className="w-full bg-[#2d2d2d] border border-[#333] p-2 rounded mb-4 focus:outline-none focus:border-blue-500"
        >
          <option value="react">React (Vite)</option>
          <option value="next">Next.js</option>
          <option value="node">Node.js</option>
          <option value="flask">Flask (Python)</option>
        </select>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
