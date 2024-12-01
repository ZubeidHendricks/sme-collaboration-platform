import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project, onJoin }) => (
  <Card className="mb-4 hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        {project.name}
        <span className={`text-sm px-2 py-1 rounded ${project.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {project.status}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <p className="text-gray-600">{project.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Budget: ${project.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={() => onJoin(project.id)} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
          Express Interest
        </button>
      </div>
    </CardContent>
  </Card>
);

export default function ProjectMarketplace() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Fetch projects from API
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    // API implementation here
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Project Marketplace</h1>
      <div className="space-y-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} onJoin={() => {}} />
        ))}
      </div>
    </div>
  );
}