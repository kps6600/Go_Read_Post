import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Shield, Plus, Trash2, Search, RefreshCw, AlertCircle, X, Mail, CheckSquare, Filter, ChevronDown,
  Eye, EyeOff, Lock, Phone, Sparkles, Check, User
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
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    role: 'USER',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

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
    setFormError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      bio: '',
      password: '',
      confirmPassword: '',
      avatar: '',
      role: 'USER',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      password: '',
      confirmPassword: '',
      avatar: user.avatar || '',
      role: user.role || 'USER',
      isActive: user.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanName = (formData.name || '').trim();
    const cleanUsername = (formData.username || '').trim().toLowerCase();
    const cleanEmail = (formData.email || '').trim().toLowerCase();

    // Field Validations
    if (!cleanName) {
      setFormError('Full Name is required.');
      return;
    }
    if (!cleanUsername) {
      setFormError('Username is required.');
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      setFormError('Username may only contain letters, numbers, underscores (_), hyphens (-), and dots (.).');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (!editingUser) {
      if (!formData.password || formData.password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match. Please re-check.');
        return;
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        setFormError('New password must be at least 6 characters.');
        return;
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match. Please re-check.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        phone: (formData.phone || '').trim(),
        bio: (formData.bio || '').trim(),
        avatar: (formData.avatar || '').trim(),
        role: 'USER',
        isActive: formData.isActive
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingUser) {
        await UserService.updateUser(editingUser._id, payload);
        if (onShowToast) onShowToast(`User account "${cleanName}" updated successfully!`);
      } else {
        await UserService.createUser(payload);
        if (onShowToast) onShowToast(`User account "${cleanName}" created successfully!`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Error saving user account.');
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

  const handleToggleStatus = async (user) => {
    if (user.role === 'SUPER_ADMIN' || user.username === 'admin' || user.email === 'admin@goreadpost.com') {
      alert('Cannot change status for the Super Administrator account.');
      return;
    }
    const nextStatus = user.isActive === false;
    setUpdatingStatusId(user._id);

    // Optimistic update
    setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));

    try {
      await UserService.updateUserStatus(user._id, nextStatus);
      if (onShowToast) {
        onShowToast(nextStatus 
          ? `User "${user.name}" is now Active.`
          : `User "${user.name}" has been Suspended.`
        );
      }
    } catch (err) {
      // Rollback on failure
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !nextStatus } : u));
      alert(err.message || 'Failed to update user status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Safe fallback helper in case any cached components or references invoke role styling
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

        {/* Right Controls: Status Filter, Reset & Add User Button */}
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

          {/* Add User CTA Button */}
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '40px',
              padding: '0 16px',
              background: 'var(--brand-primary, #dc2626)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={15} />
            <span>Add User</span>
          </button>
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
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '42px', padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle' }}></th>
                <th style={{ width: '68px', padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Sr. No.
                </th>
                <th style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Name & Username
                </th>
                <th style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Email Address
                </th>
                <th style={{ width: '140px', padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Status
                </th>
                <th style={{ width: '90px', padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => {
                const isSelected = selectedIds.has(u._id);
                const isRoot = u.role === 'SUPER_ADMIN' || u.username === 'admin' || u.email === 'admin@goreadpost.com';
                const avatarUrl = getUserAvatar(u);
                const initials = getUserInitials(u.name);

                return (
                  <tr 
                    key={u._id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      backgroundColor: isSelected ? '#fff1f2' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ width: '42px', padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(u._id);
                          else next.delete(u._id);
                          setSelectedIds(next);
                        }}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#dc2626' }}
                      />
                    </td>
                    <td style={{ width: '68px', padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
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
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Mail size={13} color="#94a3b8" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ width: '140px', padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingStatusId === u._id || isRoot}
                        title={isRoot ? 'Cannot suspend Super Admin' : (u.isActive !== false ? 'Click to suspend this account' : 'Click to activate this account')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 11px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: isRoot ? 'not-allowed' : 'pointer',
                          border: u.isActive !== false ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                          background: u.isActive !== false ? '#f0fdf4' : '#fff7ed',
                          color: u.isActive !== false ? '#15803d' : '#c2410c',
                          transition: 'all 0.15s ease',
                          opacity: updatingStatusId === u._id ? 0.6 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isRoot) e.currentTarget.style.filter = 'brightness(0.95)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.filter = 'none';
                        }}
                      >
                        <span style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: u.isActive !== false ? '#16a34a' : '#ea580c',
                          display: 'inline-block'
                        }} />
                        <span>{u.isActive !== false ? 'Active' : 'Suspended'}</span>
                      </button>
                    </td>
                    <td style={{ width: '90px', padding: '12px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New User Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '22px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Form Error Alert */}
                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Profile Avatar Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                    <img
                      src={formData.avatar || USER_AVATAR_POOL[0]}
                      alt="Avatar Preview"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = USER_AVATAR_POOL[0];
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.avatar}
                      onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = USER_AVATAR_POOL[Math.floor(Math.random() * USER_AVATAR_POOL.length)];
                          setFormData({ ...formData, avatar: rand });
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#dc2626',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Sparkles size={11} />
                        <span>Random Avatar Preset</span>
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: '' })}
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#64748b',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 1: Personal Details */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    1. Account Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Deepika Nair"
                          value={formData.name}
                          onChange={e => {
                            const val = e.target.value;
                            const update = { name: val };
                            if (!editingUser && (!formData.username || formData.username === formData.name.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                              update.username = val.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                            }
                            setFormData({ ...formData, ...update });
                          }}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 12px 0 34px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        Username <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px', fontWeight: '600', pointerEvents: 'none' }}>@</span>
                        <input
                          type="text"
                          required
                          disabled={!!editingUser}
                          placeholder="deepikan"
                          value={formData.username}
                          onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 12px 0 30px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            background: editingUser ? '#f8fafc' : '#ffffff',
                            color: editingUser ? '#64748b' : '#0f172a',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        Email Address <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="email"
                          required
                          placeholder="deepika.nair@hotmail.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 12px 0 34px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        Phone Number <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>(Optional)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 12px 0 34px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Security & Password */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    2. Security & Credentials
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        {editingUser ? 'New Password' : 'Password'} <span style={{ color: '#dc2626' }}>{editingUser ? '' : '*'}</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!editingUser}
                          placeholder={editingUser ? 'Leave blank to keep' : 'Min. 6 characters'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 36px 0 34px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '650', color: '#1e293b', marginBottom: '5px' }}>
                        Confirm Password <span style={{ color: '#dc2626' }}>{editingUser && !formData.password ? '' : '*'}</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required={!editingUser || !!formData.password}
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 36px 0 34px',
                            borderRadius: '8px',
                            border: formData.confirmPassword && formData.password !== formData.confirmPassword ? '1px solid #f87171' : '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div style={{ fontSize: '11.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                          <Check size={12} />
                          <span>Passwords match</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Account Status */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    3. Account Status
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: true })}
                      style={{
                        height: '42px',
                        borderRadius: '8px',
                        border: formData.isActive ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                        background: formData.isActive ? '#f0fdf4' : '#ffffff',
                        color: formData.isActive ? '#15803d' : '#64748b',
                        fontWeight: '650',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                      <span>Active</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: false })}
                      style={{
                        height: '42px',
                        borderRadius: '8px',
                        border: !formData.isActive ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                        background: !formData.isActive ? '#fff7ed' : '#ffffff',
                        color: !formData.isActive ? '#c2410c' : '#64748b',
                        fontWeight: '650',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }} />
                      <span>Suspended</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Sticky Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--brand-primary, #dc2626)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    opacity: saving ? 0.7 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : editingUser ? 'Update Account' : 'Create User Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}