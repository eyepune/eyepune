import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Eye, Edit3, Trash2 } from 'lucide-react';

const STATUS_COLORS = {
  draft: 'bg-gray-500/20 text-gray-400',
  scheduled: 'bg-blue-500/20 text-blue-400',
  published: 'bg-green-500/20 text-green-400',
};

export default function ContentSection() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('blog');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-admin'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  });

  const { data: cmsPages = [] } = useQuery({
    queryKey: ['cms-admin'],
    queryFn: () => base44.entities.CMS_Page.list('-created_date', 50),
  });

  const deletePost = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => qc.invalidateQueries(['blog-admin']),
  });

  const updatePost = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => qc.invalidateQueries(['blog-admin']),
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Content & Blog</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        {['blog', 'cms'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-red-600 text-white' : 'bg-white/[0.05] text-gray-400 hover:text-white'}`}
          >
            {t === 'blog' ? `Blog Posts (${posts.length})` : `CMS Pages (${cmsPages.length})`}
          </button>
        ))}
      </div>

      {tab === 'blog' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          {/* Status summary */}
          <div className="flex gap-3 mb-4">
            {['draft', 'scheduled', 'published'].map(s => (
              <div key={s} className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>
                {s}: {posts.filter(p => p.status === s).length}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Title', 'Category', 'Author', 'Status', 'Views', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 text-white max-w-[200px] truncate">{post.title}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{post.category?.replace('_', ' ')}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{post.author_name || post.author_email}</td>
                    <td className="py-2.5 pr-4">
                      <select
                        className="bg-transparent text-xs rounded-lg focus:outline-none cursor-pointer"
                        value={post.status}
                        onChange={e => updatePost.mutate({ id: post.id, data: { status: e.target.value } })}
                      >
                        {['draft', 'scheduled', 'published'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">{post.views_count || 0}</td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{post.created_date ? format(new Date(post.created_date), 'MMM d') : ''}</td>
                    <td className="py-2.5">
                      <button onClick={() => deletePost.mutate(post.id)} className="text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && <p className="text-gray-600 text-sm py-4">{isLoading ? 'Loading...' : 'No blog posts yet'}</p>}
          </div>
        </div>
      )}

      {tab === 'cms' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Page Name', 'Slug', 'Type', 'Published'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {cmsPages.map(page => (
                  <tr key={page.id}>
                    <td className="py-2.5 pr-4 text-white">{page.page_name}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs font-mono">/{page.slug}</td>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{page.page_type}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${page.published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {page.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cmsPages.length === 0 && <p className="text-gray-600 text-sm py-4">No CMS pages yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}