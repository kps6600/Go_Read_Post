import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Shield, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, X, Mail, CheckSquare, Filter
} from 'lucide-react';
import { UserService } from '../../services/userService';

export default function AdminUsersView({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
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

  const superAdminCount = useMemo(() => users.filter(u => (u.role || '').toUpperCase() === 'SUPER_ADMIN').length, [users]);
  const authorCount = useMemo(() => users.filter(u => (u.role || '').toUpperCase() === 'AUTHOR').length, [users]);
  const userCount = useMemo(() => users.filter(u => {
    const r = (u.role || '').toUpperCase();
    return r === 'USER' || r === 'READER' || (!r.includes('ADMIN') && r !== 'AUTHOR');
  }).length, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      // Role match
      if (roleFilter !== 'all') {
        const uRole = (u.role || '').toUpperCase();
        if (roleFilter === 'SUPER_ADMIN' && uRole !== 'SUPER_ADMIN') return false;
        if (roleFilter === 'AUTHOR' && uRole !== 'AUTHOR') return false;
        if (roleFilter === 'USER' && (uRole === 'SUPER_ADMIN' || uRole === 'AUTHOR')) return false;
      }

      // Status match
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'suspended' && u.isActive !== false) return false;

      // Text search
      if (!q) return true;
      return (
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
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

      {/* Header & Tab Bar (All Users and Team Users removed, only User List tab remains) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              fontWeight: '700',
              color: 'var(--brand-primary, #dc2626)',
              borderBottom: '2px solid var(--brand-primary, #dc2626)',
              fontSize: '0.94rem'
            }}
          >
            <Users size={16} />
            <span>User List ({users.length})</span>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            background: 'var(--brand-primary, #dc2626)', color: '#fff', border: 'none', borderRadius: '8px',
            fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer', marginBottom: '4px',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={15} />
          <span>Add User</span>
        </button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff1f2',
          border: '1px solid #fecdd3',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckSquare size={13} />
              <span>{selectedIds.size} Selected</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#881337', fontWeight: 600 }}>
              {selectedIds.size === filteredUsers.length ? 'All filtered accounts selected' : `${selectedIds.size} of ${filteredUsers.length} accounts selected`}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set(filteredUsers.map(u => u._id)))}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
            >
              Select All ({filteredUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Clear Selection
            </button>
          </div>

          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Trash2 size={15} />
            {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search users by name, username, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="#64748b" />
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setSelectedIds(new Set()); }}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#334155', fontWeight: '500' }}
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="SUPER_ADMIN">Super Admin ({superAdminCount})</option>
              <option value="AUTHOR">Authors ({authorCount})</option>
              <option value="USER">Users ({userCount})</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setSelectedIds(new Set()); }}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff', color: '#334155', fontWeight: '500' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        <button onClick={loadData} title="Refresh list" style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
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
            {search || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No users match your current filter criteria. Try resetting the search or filter.'
              : 'No registered accounts found in the database.'}
          </p>
          {(search || roleFilter !== 'all' || statusFilter !== 'all') ? (
            <button
              onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
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
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ width: '40px', padding: '12px 16px' }}>
                  <input 
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(filteredUsers.map(u => u._id)));
                      else setSelectedIds(new Set());
                    }}
                  />
                </th>
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
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username}</div>
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
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          style={{ padding: '6px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#334155' }}
                          title="Edit Account"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!isRoot && (
                          <button
                            onClick={() => handleDelete(u)}
                            style={{ padding: '6px', border: '1px solid #fecaca', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                            title="Delete Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

              {(() => {
                const isRootUser = editingUser && (editingUser.username === 'admin' || editingUser.email === 'admin@goreadpost.com');
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                        Account Role *
                      </label>
                      <select
                        value={isRootUser ? 'SUPER_ADMIN' : formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        disabled={isRootUser}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: isRootUser ? '#f8fafc' : '#fff' }}
                      >
                        <option value="USER">User (Reader)</option>
                        <option value="AUTHOR">Author</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      {isRootUser && (
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Primary root admin role is locked.
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                        Account Status
                      </label>
                      <select
                        value={isRootUser ? 'active' : (formData.isActive ? 'active' : 'suspended')}
                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        disabled={isRootUser}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: isRootUser ? '#f8fafc' : '#fff' }}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      {isRootUser && (
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Root admin cannot be deactivated.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

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