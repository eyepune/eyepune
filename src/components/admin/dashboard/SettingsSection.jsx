import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Package, IndianRupee, PuzzleIcon, UserPlus } from 'lucide-react';

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? 'bg-red-600 text-white' : 'bg-white/[0.05] text-gray-400 hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function UsersTab() {
  const { data: users = [] } = useQuery({
    queryKey: ['users-settings'],
    queryFn: () => base44.entities.User.list(),
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      setInviteMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (e) {
      setInviteMsg('Failed to send invite');
    }
    setInviting(false);
  };

  return (
    <div className="space-y-5">
      {/* Invite */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-red-400" /> Invite User</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            className="flex-1 min-w-[200px] bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500/50"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <select
            className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-gray-400 text-sm focus:outline-none"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            {inviting ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
        {inviteMsg && <p className="text-sm text-green-400 mt-2">{inviteMsg}</p>}
      </div>

      {/* Users list */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">All Users ({users.length})</h3>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
              <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">
                {u.full_name?.charAt(0) || u.email?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {u.role}
              </span>
            </div>
          ))}
          {users.length === 0 && <p className="text-gray-600 text-sm">No users found</p>}
        </div>
      </div>
    </div>
  );
}

function PackagesTab() {
  const { data: packages = [] } = useQuery({
    queryKey: ['packages-settings'],
    queryFn: () => base44.entities.ServicePackage.list(),
  });
  const { data: plans = [] } = useQuery({
    queryKey: ['plans-settings'],
    queryFn: () => base44.entities.Pricing_Plan.list(),
  });

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Service Packages ({packages.length})</h3>
        <div className="space-y-2">
          {packages.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.replace('_', ' ')}</p>
              </div>
              <p className="text-green-400 font-bold text-sm">₹{p.price?.toLocaleString()}</p>
            </div>
          ))}
          {packages.length === 0 && <p className="text-gray-600 text-sm">No packages yet</p>}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Pricing Plans ({plans.length})</h3>
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.billing_cycle} · {p.category}</p>
              </div>
              <p className="text-green-400 font-bold text-sm">₹{p.price?.toLocaleString()}</p>
            </div>
          ))}
          {plans.length === 0 && <p className="text-gray-600 text-sm">No pricing plans yet</p>}
        </div>
      </div>
    </div>
  );
}

export default function SettingsSection() {
  const [tab, setTab] = useState('users');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      <div className="flex gap-2 flex-wrap">
        <Tab label="Users" active={tab === 'users'} onClick={() => setTab('users')} />
        <Tab label="Packages & Pricing" active={tab === 'packages'} onClick={() => setTab('packages')} />
      </div>
      {tab === 'users' && <UsersTab />}
      {tab === 'packages' && <PackagesTab />}
    </div>
  );
}