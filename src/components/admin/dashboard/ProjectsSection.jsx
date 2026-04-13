import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  onboarding: 'bg-yellow-500/20 text-yellow-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  review: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  on_hold: 'bg-gray-500/20 text-gray-400',
};

const STATUSES = ['onboarding', 'in_progress', 'review', 'completed', 'on_hold'];

export default function ProjectsSection() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project_name: '', client_name: '', client_email: '', project_type: 'web_app', status: 'onboarding', budget: '' });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-admin'],
    queryFn: () => base44.entities.ClientProject.list('-created_date', 100),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones-admin'],
    queryFn: () => base44.entities.ClientMilestone.list('-created_date', 200),
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ClientProject.update(id, data),
    onSuccess: () => qc.invalidateQueries(['projects-admin']),
  });

  const createProject = useMutation({
    mutationFn: (data) => base44.entities.ClientProject.create(data),
    onSuccess: () => { qc.invalidateQueries(['projects-admin']); setShowForm(false); },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Projects</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">New Project</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'project_name', label: 'Project Name', placeholder: 'Project name' },
              { key: 'client_name', label: 'Client Name', placeholder: 'Client name' },
              { key: 'client_email', label: 'Client Email', placeholder: 'client@email.com' },
              { key: 'budget', label: 'Budget (₹)', placeholder: '50000' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createProject.mutate({ ...form, budget: Number(form.budget) })} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/[0.05] text-gray-400 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {STATUSES.map(s => {
          const count = projects.filter(p => p.status === s).length;
          return (
            <div key={s} className={`px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>
              {s.replace('_', ' ')}: {count}
            </div>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {isLoading && <p className="text-gray-600 text-sm">Loading...</p>}
        {projects.map(project => {
          const projectMilestones = milestones.filter(m => m.project_id === project.id);
          const completedM = projectMilestones.filter(m => m.status === 'completed').length;
          const isExpanded = expanded === project.id;

          return (
            <div key={project.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02]"
                onClick={() => setExpanded(isExpanded ? null : project.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{project.project_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                      {project.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{project.client_name} · {project.client_email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-white font-bold">{project.progress_percentage || 0}%</p>
                    <p className="text-xs text-gray-600">Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{completedM}/{projectMilestones.length}</p>
                    <p className="text-xs text-gray-600">Milestones</p>
                  </div>
                  {project.budget && (
                    <div className="text-center">
                      <p className="text-white font-bold">₹{(project.budget / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-600">Budget</p>
                    </div>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </div>

              {isExpanded && (
                <div className="border-t border-white/[0.06] p-4 space-y-4">
                  {/* Progress slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span><span>{project.progress_percentage || 0}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100"
                      value={project.progress_percentage || 0}
                      onChange={e => updateProject.mutate({ id: project.id, data: { progress_percentage: Number(e.target.value) } })}
                      className="w-full accent-red-500"
                    />
                  </div>
                  {/* Status */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-500">Status:</label>
                    <select
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                      value={project.status}
                      onChange={e => updateProject.mutate({ id: project.id, data: { status: e.target.value } })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  {/* Milestones */}
                  {projectMilestones.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Milestones</p>
                      <div className="space-y-1">
                        {projectMilestones.map(m => (
                          <div key={m.id} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'completed' ? 'bg-green-500' : m.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-600'}`} />
                            <p className="text-sm text-gray-300">{m.title}</p>
                            {m.due_date && <p className="text-xs text-gray-600 ml-auto">{format(new Date(m.due_date), 'MMM d')}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && !isLoading && <p className="text-gray-600 text-sm">No projects yet</p>}
      </div>
    </div>
  );
}