import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Shield, Plus, Trash2, Search, RefreshCw, AlertCircle, X, Mail, CheckSquare, Filter, ChevronDown, RotateCcw
} from 'lucide-react';
import { UserService } from '../../services/userService';

const USER_AVATAR_POOL = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80'
];

function getUserAvatar(user) {
  if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim()) {
    return user.avatar;
  }
  const str = (user.username || user.email || user.name || 'user').toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_AVATAR_POOL[Math.abs(hash) % USER_AVATAR_POOL.length];
}

function getUserInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminUsersView({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    avatar: '',
    role: 'USER',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const uData = await UserService.getUsers();
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) {
      setError(err.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  // Exclude team members (Super Admin, Authors, Admin, Editor)
  // This page exclusively manages registered community readers / regular users
  const isTeamMember = (u) => {
    const r = (u.role || '').toUpperCase();
    return r === 'SUPER_ADMIN' || r === 'AUTHOR' || r === 'ADMIN' || r === 'EDITOR';
  };

  const communityUsers = useMemo(() => {
    return users.filter(u => !isTeamMember(u));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communityUsers.filter(u => {
      // Status match
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'suspended' && u.isActive !== false) return false;

      // Text search
      if (!q) return true;
      return (
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [communityUsers, search, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      avatar: '',
      role: 'USER',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
      isActive: user.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser._id, formData);
        if (onShowToast) onShowToast(`User "${formData.name}" updated successfully!`);
      } else {
        await UserService.createUser(formData);
        if (onShowToast) onShowToast(`User "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('Cannot delete the root Super Administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.name}" (@${user.username})?`)) return;

    try {
      await UserService.deleteUser(user._id);
      if (onShowToast) onShowToast(`Account "${user.name}" removed`);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting account');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected account(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      await UserService.bulkDelete(Array.from(selectedIds));
      if (onShowToast) onShowToast(`Successfully deleted ${count} accounts`);
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      alert('Error during bulk delete: ' + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch ((role || '').toUpperCase()) {
      case 'SUPER_ADMIN':
        return { background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', label: 'Super Admin' };
      case 'AUTHOR':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', label: 'Author' };
      case 'USER':
      case 'READER':
      default:
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', label: 'User' };
    }
  };

  return (
    <div className="admin-page-container">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={openCreateModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            background: 'var(--brand-primary, #dc2626)', color: '#fff', border: 'none', borderRadius: '8px',
            fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={15} />
          <span>Add User</span>
        </button>
      </div>

      {/* Modern Search & Filter Toolbar Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {/* Search Box - Expands dynamically across container */}
        <div style={{ position: 'relative', flex: '1 1 320px', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 34px 0 38px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13.5px',
              background: '#f8fafc',
              color: '#0f172a',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={e => { e.target.style.background = '#ffffff'; e.target.style.borderColor = 'var(--brand-primary, #dc2626)'; e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.12)'; }}
            onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                padding: 0
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Right Controls: Status Filter & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Status Filter Dropdown */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Filter size={13} color={statusFilter !== 'all' ? 'var(--brand-primary, #dc2626)' : '#64748b'} style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setSelectedIds(new Set()); }}
              style={{
                appearance: 'none',
                height: '40px',
                minWidth: '150px',
                padding: '0 32px 0 32px',
                border: statusFilter !== 'all' ? '1.5px solid rgba(220, 38, 38, 0.4)' : '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: statusFilter !== 'all' ? '700' : '500',
                background: statusFilter !== 'all' ? '#fff1f2' : '#f8fafc',
                color: statusFilter !== 'all' ? 'var(--brand-primary, #dc2626)' : '#334155',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
            <ChevronDown size={14} color={statusFilter !== 'all' ? 'var(--brand-primary, #dc2626)' : '#94a3b8'} style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
          </div>

          {/* Reset Filters button */}
          {(search || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter('all'); setSelectedIds(new Set()); }}
              title="Reset all filters"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '40px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                background: '#ffffff',
                color: '#dc2626',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
          <div>Loading accounts...</div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.35, color: '#0f172a' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '4px' }}>
            No Users Found
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 16px' }}>
            {search || statusFilter !== 'all'
              ? 'No users match your current filter criteria. Try resetting the search or filter.'
              : 'No registered user accounts found in the database.'}
          </p>
          {(search || statusFilter !== 'all') ? (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.84rem' }}
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                background: 'var(--brand-primary, #dc2626)', color: '#fff', border: 'none', borderRadius: '8px',
                fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Add User</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Sub-Header Bar: Select All & Bulk Actions */}
          <div className="abv-cards-header-bar" style={{ marginBottom: '0.5rem', padding: '0.2rem 0.25rem 0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label className="abv-select-all-label" title="Select all users">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size > 0 && selectedIds.size === filteredUsers.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filteredUsers.map(u => u._id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#dc2626' }}
                />
                <span>Select All</span>
              </label>
              {selectedIds.size > 0 && (
                <span className="abv-selected-pill">
                  {selectedIds.size} of {filteredUsers.length} selected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {selectedIds.size > 0 && (
                <div className="abv-bulk-actions-group">
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="abv-bulk-btn abv-bulk-btn-delete"
                    title="Delete selected accounts"
                  >
                    <Trash2 size={14} />
                    <span>{bulkDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ width: '40px', padding: '12px 16px' }}></th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Name & Username</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Email Address</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const badge = getRoleBadgeStyle(u.role);
                const isSelected = selectedIds.has(u._id);
                const isRoot = u.role === 'SUPER_ADMIN' || u.username === 'admin' || u.email === 'admin@goreadpost.com';
                const avatarUrl = getUserAvatar(u);
                const initials = getUserInitials(u.name);

                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isSelected ? '#fff1f2' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(u._id);
                          else next.delete(u._id);
                          setSelectedIds(next);
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
                          <img
                            src={avatarUrl}
                            alt={u.name}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              color: '#475569',
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '13px',
                              border: '1.5px solid #cbd5e1',
                              textTransform: 'uppercase'
                            }}
                          >
                            {initials}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="#94a3b8" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        background: badge.background,
                        color: badge.color,
                        border: badge.border
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: u.isActive !== false ? '#059669' : '#94a3b8' }}>
                        {u.isActive !== false ? '● Active' : '○ Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(u)}
                        style={{
                          padding: '6px',
                          border: '1px solid #fecaca',
                          background: '#fff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        title="Delete Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New User Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: editingUser ? '#f8fafc' : '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@goreadpost.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                  {editingUser ? 'New Password (Leave blank to keep existing)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>Profile Photo / Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.avatar || ''}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                    Account Role
                  </label>
                  <select
                    value="USER"
                    disabled
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc', color: '#475569', cursor: 'not-allowed' }}
                  >
                    <option value="USER">User (Reader)</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                    Registered community reader. Authors are managed under Authors desk.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                    Account Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'suspended'}
                    onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 18px', background: 'var(--brand-primary, #dc2626)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {saving ? 'Saving...' : editingUser ? 'Update Account' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}