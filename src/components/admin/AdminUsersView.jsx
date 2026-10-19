import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, X, Check, Lock, Mail, UserCheck, CheckSquare
} from 'lucide-react';
import { UserService } from '../../services/userService';

export default function AdminUsersView({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'AUTHOR',
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
      const [uData, rData] = await Promise.all([
        UserService.getUsers(),
        UserService.getRoles()
      ]);
      setUsers(Array.isArray(uData) ? uData : []);
      setRoles(Array.isArray(rData) ? rData : []);
    } catch (err) {
      setError(err.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'AUTHOR',
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
      role: user.role || 'AUTHOR',
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
        if (onShowToast) onShowToast(`User ${formData.name} updated!`);
      } else {
        await UserService.createUser(formData);
        if (onShowToast) onShowToast(`User ${formData.name} created!`);
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
      alert('Cannot delete the root SUPER_ADMIN user.');
      return;
    }
    if (!window.confirm(`Delete staff account "${user.name}" (${user.username})?`)) return;

    try {
      await UserService.deleteUser(user._id);
      if (onShowToast) onShowToast(`User ${user.name} removed`);
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting user');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected users? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      await UserService.bulkDelete(Array.from(selectedIds));
      if (onShowToast) onShowToast(`Successfully deleted ${count} users`);
      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      alert('Error during bulk delete: ' + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8' };
      case 'ADMIN':
        return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'EDITOR':
        return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      default:
        return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: activeTab === 'users' ? '700' : '500',
              color: activeTab === 'users' ? 'var(--brand-primary, #0ea5e9)' : '#64748b',
              borderBottom: activeTab === 'users' ? '2px solid var(--brand-primary, #0ea5e9)' : '2px solid transparent'
            }}
          >
            <Users size={16} />
            <span>Editorial Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontWeight: activeTab === 'roles' ? '700' : '500',
              color: activeTab === 'roles' ? 'var(--brand-primary, #0ea5e9)' : '#64748b',
              borderBottom: activeTab === 'roles' ? '2px solid var(--brand-primary, #0ea5e9)' : '2px solid transparent'
            }}
          >
            <Shield size={16} />
            <span>Role Permissions Matrix</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              background: 'var(--brand-primary, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: '600', fontSize: '0.84rem', cursor: 'pointer', marginBottom: '4px',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
            }}
          >
            <Plus size={15} />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {activeTab === 'users' ? (
        <>
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
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  backgroundColor: '#e11d48',
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
                  {selectedIds.size === filteredUsers.length ? 'All filtered users selected' : `${selectedIds.size} of ${filteredUsers.length} users selected`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set(filteredUsers.map(u => u._id)))}
                  style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
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
                  backgroundColor: '#e11d48',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                }}
              >
                <Trash2 size={15} />
                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search staff by name, email, role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <button onClick={loadData} style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Users Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
              <div>Loading newsroom users...</div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
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
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Assigned Role</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const badgeStyle = getRoleBadgeStyle(u.role);
                    const isSelected = selectedIds.has(u._id);
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
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', ...badgeStyle }}>
                            {u.role}
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
                              title="Edit User"
                            >
                              <Edit2 size={14} />
                            </button>
                            {u.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleDelete(u)}
                                style={{ padding: '6px', border: '1px solid #fecaca', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                                title="Delete User"
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
        </>
      ) : (
        /* Roles Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            {
              role: 'SUPER_ADMIN',
              name: 'Super Administrator',
              desc: 'Full platform authority. Manages database, security keys, all roles, and global configurations.',
              perms: ['All Permissions', 'Manage Users & Roles', 'Delete All Records', 'Settings & System CMS']
            },
            {
              role: 'ADMIN',
              name: 'Administrator',
              desc: 'Manages navigation, homepage, authors, categories, media, and all editorial publishing desks.',
              perms: ['Publish & Unpublish Articles', 'Manage Navigation & Footer', 'Manage Taxonomy & Media', 'Homepage Curation']
            },
            {
              role: 'EDITOR',
              name: 'Senior Editor',
              desc: 'Reviews drafts submitted by authors, schedules stories, edits taxonomy, and curates featured flags.',
              perms: ['Review & Edit Articles', 'Publish Approved Stories', 'Create Categories & Tags', 'Upload Media Assets']
            },
            {
              role: 'AUTHOR',
              name: 'Staff Reporter / Author',
              desc: 'Drafts articles, uploads story images, tags topics, and submits pieces for editorial review.',
              perms: ['Create & Edit Own Drafts', 'Upload Story Media', 'Tag Topics & Entities', 'Read All Published Content']
            }
          ].map(r => (
            <div key={r.role} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={18} color="var(--brand-primary, #0ea5e9)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{r.name}</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px' }}>{r.desc}</p>

              <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>GRANULAR PERMISSIONS:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
                {r.perms.map(p => (
                  <li key={p} style={{ marginBottom: '4px' }}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {editingUser ? `Edit Account: ${editingUser.name}` : 'Create Newsroom User'}
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
                    placeholder="e.g. Maya Iyer"
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
                    placeholder="e.g. mayaiyer"
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
                  placeholder="maya@goreadpost.com"
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
                        Assign Role *
                      </label>
                      <select
                        value={isRootUser ? 'SUPER_ADMIN' : formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        disabled={isRootUser}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: isRootUser ? '#f8fafc' : '#fff' }}
                      >
                        <option value="AUTHOR">AUTHOR (Staff Reporter)</option>
                        <option value="EDITOR">EDITOR (Desk Editor)</option>
                        <option value="ADMIN">ADMIN (Site Admin)</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (Executive)</option>
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
                  style={{ padding: '8px 18px', background: 'var(--brand-primary, #0ea5e9)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {saving ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
