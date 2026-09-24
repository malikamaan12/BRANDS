import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, UserPlus, Users, Shield, ShieldCheck, Trash2, 
  Key, AlertCircle, CheckCircle2, UserCheck, ShieldAlert,
  Lock, Sparkles, Building2, UserX, Search, Edit3, KeyRound,
  RotateCcw, Eye, EyeOff
} from 'lucide-react';
import { authService } from '../services/authService';
import IpHubLogo from './IpHubLogo';

export default function AdminPanelModal({ isOpen, onClose, currentUser, onShowToast }) {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'matrix'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'admin' | 'user'
  
  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('user'); // 'user' | 'admin'
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState('user');

  // Password reset state
  const [resettingUser, setResettingUser] = useState(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsersList();
      setFormError('');
      setFormSuccess('');
      setEditingUser(null);
      setResettingUser(null);
    }
  }, [isOpen]);

  const loadUsersList = async () => {
    // Load local first
    const list = authService.getUsers();
    setUsers(list);

    // Sync remote in background
    try {
      const remoteList = await authService.syncUsersFromRemote();
      if (remoteList && remoteList.length > 0) {
        setUsers(remoteList);
      }
    } catch {}
  };

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.title && u.title.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    normalUsers: users.filter(u => u.role === 'user').length
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const res = await authService.createUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      title: newTitle
    });

    if (res.success) {
      setFormSuccess(`Account successfully provisioned for ${res.user.name} (${res.user.role === 'admin' ? 'Admin' : 'Normal User'})`);
      loadUsersList();
      onShowToast(`Created account for ${res.user.name}`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewTitle('');
      setNewRole('user');
      setTimeout(() => {
        setActiveTab('list');
        setFormSuccess('');
      }, 1200);
    } else {
      setFormError(res.error || 'Failed to provision account');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.isRoot) {
      alert('Cannot delete the primary root administrator account.');
      return;
    }
    if (userToDelete.id === currentUser?.id) {
      alert('Cannot delete your own active administrator account while logged in.');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete "${userToDelete.name}" (${userToDelete.email})?`)) {
      const res = await authService.deleteUser(userToDelete.id, currentUser?.id);
      if (res.success) {
        loadUsersList();
        onShowToast(`Deleted account: ${userToDelete.name}`);
      } else {
        alert(res.error || 'Failed to delete user.');
      }
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditTitle(user.title || '');
    setEditRole(user.role);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.isRoot && editRole !== 'admin') {
      alert('Cannot demote the primary root administrator.');
      return;
    }

    const res = await authService.updateUser(editingUser.id, {
      name: editName,
      title: editTitle,
      role: editRole
    });

    if (res.success) {
      loadUsersList();
      onShowToast(`Updated user details for ${editName}`);
      setEditingUser(null);
    } else {
      alert(res.error || 'Failed to update user.');
    }
  };

  const handleOpenResetPassword = (user) => {
    setResettingUser(user);
    setNewResetPassword('');
    setShowResetPass(false);
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    if (!resettingUser) return;

    if (!newResetPassword || newResetPassword.trim().length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    const res = await authService.updateUserPassword(resettingUser.id, newResetPassword.trim());
    if (res.success) {
      loadUsersList();
      onShowToast(`Reset password for ${resettingUser.name}`);
      setResettingUser(null);
    } else {
      alert(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="glass-modal rbac-admin-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(12, 16, 32, 0.96)',
          backdropFilter: 'blur(35px) saturate(200%)',
          WebkitBackdropFilter: 'blur(35px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 30px 75px -15px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          borderRadius: '26px',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.6rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <IpHubLogo size={38} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                  Admin Control Panel & User Management
                </h2>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.18)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.35)'
                }}>
                  Admin Exclusive
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Provision corporate accounts, configure RBAC permissions & manage Neon database access
              </p>
            </div>
          </div>

          <button 
            className="apple-icon-btn" 
            onClick={onClose}
            aria-label="Close admin modal"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Access Check */}
        {!isAdmin ? (
          <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#f87171'
            }}>
              <ShieldAlert size={30} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Administrative Privileges Required
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
              Your current account (<strong>{currentUser?.name || 'User'}</strong>) is assigned the <strong>Normal User</strong> role. Normal users can perform operational licensing tasks but cannot access the Admin Panel or delete entertainment property cards.
            </p>
            <button 
              className="apple-btn apple-btn-primary"
              onClick={onClose}
              style={{ padding: '0.65rem 1.6rem' }}
            >
              Return to Portfolio
            </button>
          </div>
        ) : (
          <>
            {/* Quick Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              padding: '0.85rem 1.6rem',
              background: 'rgba(255, 255, 255, 0.015)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Accounts</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#ffffff' }}>{stats.total}</div>
                </div>
                <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.22)',
                borderRadius: '12px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Master Admins</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#fbbf24' }}>{stats.admins}</div>
                </div>
                <ShieldCheck size={18} style={{ color: '#fbbf24' }} />
              </div>

              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.22)',
                borderRadius: '12px',
                padding: '0.55rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Normal Users</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#38bdf8' }}>{stats.normalUsers}</div>
                </div>
                <UserCheck size={18} style={{ color: '#38bdf8' }} />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.6rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
            }}>
              <button
                className={`apple-btn ${activeTab === 'list' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                onClick={() => setActiveTab('list')}
              >
                <Users size={14} />
                <span>User Directory ({users.length})</span>
              </button>

              <button
                className={`apple-btn ${activeTab === 'create' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                onClick={() => {
                  setActiveTab('create');
                  setFormError('');
                  setFormSuccess('');
                }}
              >
                <UserPlus size={14} />
                <span>Provision Account</span>
              </button>

              <button
                className={`apple-btn ${activeTab === 'matrix' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem' }}
                onClick={() => setActiveTab('matrix')}
              >
                <Shield size={14} />
                <span>RBAC Permissions Matrix</span>
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ padding: '1.4rem 1.6rem', overflowY: 'auto', flex: 1 }}>
              
              {/* TAB 1: USERS DIRECTORY */}
              {activeTab === 'list' && (
                <div>
                  {/* Search and Filters Bar */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input
                        type="text"
                        placeholder="Search by name, email, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem 0.5rem 2rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        className="apple-input-focus"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => setFilterRole('all')}
                        className={`apple-btn ${filterRole === 'all' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      >
                        All ({users.length})
                      </button>
                      <button
                        onClick={() => setFilterRole('admin')}
                        className={`apple-btn ${filterRole === 'admin' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      >
                        👑 Admins ({stats.admins})
                      </button>
                      <button
                        onClick={() => setFilterRole('user')}
                        className={`apple-btn ${filterRole === 'user' ? 'apple-btn-primary' : 'apple-btn-glass'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      >
                        👤 Normal Users ({stats.normalUsers})
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>User</th>
                          <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Email</th>
                          <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Role</th>
                          <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                              No users match your search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const isCurrentUser = u.id === currentUser?.id;
                            const isUserAdmin = u.role === 'admin';

                            return (
                              <tr 
                                key={u.id}
                                style={{ 
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                  background: isCurrentUser ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                }}
                              >
                                {/* User Info */}
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                      width: 34,
                                      height: 34,
                                      borderRadius: '50%',
                                      background: isUserAdmin 
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #8a1538 100%)' 
                                        : 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                                      color: '#ffffff',
                                      fontWeight: 800,
                                      fontSize: '0.78rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 750, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <span>{u.name}</span>
                                        {isCurrentUser && (
                                          <span style={{ fontSize: '0.62rem', background: 'rgba(255, 255, 255, 0.12)', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>
                                            You
                                          </span>
                                        )}
                                        {u.isRoot && (
                                          <span style={{ fontSize: '0.62rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '1px 5px', borderRadius: '4px' }}>
                                            Primary Root
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                        {u.title || (isUserAdmin ? 'System Administrator' : 'Licensing Specialist')}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Email */}
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                                  {u.email}
                                </td>

                                {/* Role */}
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  {isUserAdmin ? (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.22rem 0.6rem',
                                      borderRadius: '6px',
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      color: '#fbbf24',
                                      border: '1px solid rgba(245, 158, 11, 0.3)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700
                                    }}>
                                      <span>👑 Admin</span>
                                    </span>
                                  ) : (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.22rem 0.6rem',
                                      borderRadius: '6px',
                                      background: 'rgba(6, 182, 212, 0.12)',
                                      color: '#38bdf8',
                                      border: '1px solid rgba(6, 182, 212, 0.25)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700
                                    }}>
                                      <span>👤 Normal User</span>
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                    
                                    {/* Edit User Button */}
                                    <button
                                      onClick={() => handleOpenEdit(u)}
                                      className="apple-icon-btn"
                                      title={`Edit details for ${u.name}`}
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '6px',
                                        background: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <Edit3 size={13} />
                                    </button>

                                    {/* Reset Password Button */}
                                    <button
                                      onClick={() => handleOpenResetPassword(u)}
                                      className="apple-icon-btn"
                                      title={`Reset password for ${u.name}`}
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '6px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        border: '1px solid rgba(245, 158, 11, 0.25)',
                                        color: '#fbbf24',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      <KeyRound size={13} />
                                    </button>

                                    {/* Delete Button */}
                                    {u.isRoot ? (
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', padding: '0 4px' }}>Root</span>
                                    ) : isCurrentUser ? (
                                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', padding: '0 4px' }}>Self</span>
                                    ) : (
                                      <button
                                        onClick={() => handleDeleteUser(u)}
                                        className="apple-icon-btn"
                                        title={`Delete account for ${u.name}`}
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: '6px',
                                          background: 'rgba(239, 68, 68, 0.12)',
                                          border: '1px solid rgba(239, 68, 68, 0.25)',
                                          color: '#f87171',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}

                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Enforced Rule Footnote */}
                  <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Shield size={13} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Role Enforcement: Normal users can perform all operational tasks, but card deletion is strictly restricted to Admins. All user changes sync automatically to Neon PostgreSQL.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: PROVISION NEW USER */}
              {activeTab === 'create' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Provision Internal User Account
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                      Accounts created here can immediately log in to IP HUB. Public self-registration is disabled.
                    </p>
                  </div>

                  {formError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '12px',
                      padding: '0.7rem 0.9rem',
                      marginBottom: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#fca5a5',
                      fontSize: '0.76rem'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0, color: '#f87171' }} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '12px',
                      padding: '0.7rem 0.9rem',
                      marginBottom: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6ee7b7',
                      fontSize: '0.76rem'
                    }}>
                      <CheckCircle2 size={15} style={{ flexShrink: 0, color: '#34d399' }} />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sarah Jenkins"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          className="apple-input-focus"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Corporate Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="colleague@eeeqa.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          className="apple-input-focus"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Security Password * (Min 6 chars)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          className="apple-input-focus"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Job Title / Designation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Live IP Licensing Manager"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          className="apple-input-focus"
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Assign Role & Permissions *
                      </label>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                        
                        <div 
                          onClick={() => setNewRole('user')}
                          style={{
                            background: newRole === 'user' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: newRole === 'user' ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '14px',
                            padding: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <UserCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                              <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Normal User</strong>
                            </div>
                            <span style={{ fontSize: '0.64rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Standard
                            </span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                            Can perform <strong>all operational tasks</strong> (search, filter, view dossiers, add leads, update pipeline, export), <strong>BUT CANNOT DELETE</strong> any IP or brand card.
                          </p>
                        </div>

                        <div 
                          onClick={() => setNewRole('admin')}
                          style={{
                            background: newRole === 'admin' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: newRole === 'admin' ? '1.5px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '14px',
                            padding: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <ShieldCheck size={16} style={{ color: 'var(--accent-gold)' }} />
                              <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Administrator</strong>
                            </div>
                            <span style={{ fontSize: '0.64rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              Full Control
                            </span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                            <strong>Complete control</strong>. Can delete any entertainment property card, access this Admin Panel, and manage all user accounts.
                          </p>
                        </div>

                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="apple-btn apple-btn-glass"
                        onClick={() => setActiveTab('list')}
                        style={{ padding: '0.6rem 1.1rem' }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="apple-btn apple-btn-primary"
                        style={{ padding: '0.6rem 1.4rem' }}
                      >
                        <UserPlus size={15} />
                        <span>Provision Account</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* TAB 3: RBAC ROLES & PERMISSIONS MATRIX */}
              {activeTab === 'matrix' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Role-Based Access Control (RBAC) Specification
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                      Detailed permission enforcement policy across IP HUB
                    </p>
                  </div>

                  <div style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Feature / Capability</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>👤 Normal User</th>
                          <th style={{ padding: '0.75rem 1rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>👑 Master Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { feature: 'View & Explore Entertainment IPs', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'Search, Category & Venue Filters', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'View 1-Screen Spatial Dossier Modal', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: '1-Click Direct Website & LinkedIn Links', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'Advance Deal Pipeline Status (Kanban / Cards)', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'Register New IP Lead', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'Export Portfolio to CSV & JSON', user: '✅ Full Access', admin: '✅ Full Access' },
                          { feature: 'Trigger Automated Daily Discovery (+10)', user: '✅ Full Access', admin: '✅ Full Access' },
                          { 
                            feature: 'DELETE Property / Brand Card', 
                            user: '❌ RESTRICTED (Button Disabled)', 
                            admin: '✅ Full Permission', 
                            highlight: true 
                          },
                          { 
                            feature: 'Admin Control Panel Access', 
                            user: '❌ RESTRICTED (Hidden)', 
                            admin: '✅ Full Permission', 
                            highlight: true 
                          },
                          { 
                            feature: 'Provision Internal Accounts', 
                            user: '❌ RESTRICTED', 
                            admin: '✅ Full Permission', 
                            highlight: true 
                          },
                          { 
                            feature: 'Reset User Passwords & Delete Users', 
                            user: '❌ RESTRICTED', 
                            admin: '✅ Full Permission', 
                            highlight: true 
                          }
                        ].map((row, idx) => (
                          <tr 
                            key={idx}
                            style={{ 
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              background: row.highlight ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '0.75rem 1rem', fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#ffffff' : 'var(--text-secondary)' }}>
                              {row.feature}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: row.user.includes('RESTRICTED') ? '#f87171' : '#38bdf8' }}>
                              {row.user}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#fbbf24', fontWeight: 700 }}>
                              {row.admin}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* MODAL: EDIT USER INLINE */}
        {editingUser && (
          <div className="modal-backdrop" style={{ zIndex: 10001 }} onClick={() => setEditingUser(null)}>
            <div 
              className="glass-modal" 
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '460px',
                width: '92%',
                background: 'rgba(15, 20, 38, 0.96)',
                backdropFilter: 'blur(30px)',
                borderRadius: '20px',
                padding: '1.6rem',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Edit User: {editingUser.name}
                </h3>
                <button onClick={() => setEditingUser(null)} className="apple-icon-btn" style={{ width: 28, height: 28 }}>
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Job Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Role</label>
                  <select
                    value={editRole}
                    disabled={editingUser.isRoot}
                    onChange={(e) => setEditRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#161d36',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="user">👤 Normal User (No Card Deletion)</option>
                    <option value="admin">👑 Administrator (Full Control & Deletions)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setEditingUser(null)} className="apple-btn apple-btn-glass" style={{ padding: '0.5rem 1rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="apple-btn apple-btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RESET PASSWORD */}
        {resettingUser && (
          <div className="modal-backdrop" style={{ zIndex: 10001 }} onClick={() => setResettingUser(null)}>
            <div 
              className="glass-modal" 
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '440px',
                width: '92%',
                background: 'rgba(15, 20, 38, 0.96)',
                backdropFilter: 'blur(30px)',
                borderRadius: '20px',
                padding: '1.6rem',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Reset Password: {resettingUser.name}
                </h3>
                <button onClick={() => setResettingUser(null)} className="apple-icon-btn" style={{ width: 28, height: 28 }}>
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    New Password (Min 6 characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPass ? 'text' : 'password'}
                      required
                      placeholder="Enter new password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 2.4rem 0.65rem 0.85rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPass(!showResetPass)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showResetPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setResettingUser(null)} className="apple-btn apple-btn-glass" style={{ padding: '0.5rem 1rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="apple-btn apple-btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
