// ============================================================================
// IP HUB — Role-Based Access Control (RBAC) & Authentication Service
// Backed by Neon Serverless PostgreSQL & Local-First Resilient Cache
// ============================================================================
// Roles:
//  - 'admin': Full administrative control. Can delete any IP/brand card,
//             manage users, provision new accounts, and access Admin Panel.
//  - 'user':  Operational user. Can perform all tasks (search, filter, view
//             dossiers, update status, add leads, export, extract daily),
//             BUT CANNOT delete any IP or brand card.
//
// NOTE: Self-registration / public signup is strictly disabled.
//       Accounts can ONLY be provisioned by an Admin via the Admin Panel.
// ============================================================================

const USERS_STORAGE_KEY = 'iphub_rbac_users_v2';
const SESSION_STORAGE_KEY = 'iphub_rbac_session_v2';

// Pre-seeded default credentials
export const DEFAULT_USERS = [
  {
    id: 'usr-admin-01',
    name: 'Master Admin',
    email: 'admin@iphub.com',
    password: 'Admin@IPHub2026!',
    role: 'admin',
    title: 'Chief Licensing Officer & Platform Administrator',
    createdAt: '2026-01-15T08:00:00.000Z',
    isRoot: true,
    isActive: true
  },
  {
    id: 'usr-licensing-02',
    name: 'Licensing Associate',
    email: 'user@iphub.com',
    password: 'User@IPHub2026!',
    role: 'user',
    title: 'Senior Entertainment Licensing Lead',
    createdAt: '2026-02-01T10:00:00.000Z',
    isRoot: false,
    isActive: true
  }
];

class AuthService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch (e) {
      console.warn('AuthService storage initialization warning:', e);
    }
  }

  // Fetch users from Neon PostgreSQL with local fallback
  async syncUsersFromRemote() {
    try {
      const res = await fetch('/api/users', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          const formatted = data.users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            title: u.title,
            isRoot: Boolean(u.is_root),
            isActive: u.is_active !== false,
            createdAt: u.created_at
          }));
          this.saveUsers(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('[AuthService] Remote user sync fallback to local cache:', err.message);
    }
    return this.getUsers();
  }

  getUsers() {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  saveUsers(users) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      // Verify user still exists in current user directory
      const users = this.getUsers();
      const matched = users.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
      if (matched) {
        const sanitized = { ...matched };
        delete sanitized.password;
        return sanitized;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  setCurrentUser(user) {
    if (typeof window === 'undefined') return;
    if (user) {
      const sanitized = { ...user };
      delete sanitized.password; // Never keep raw password in session storage
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sanitized));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  login(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedEmail || !trimmedPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return { 
        success: false, 
        error: 'Account not found. Accounts are provisioned exclusively by system administrators.' 
      };
    }

    if (user.isActive === false) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact an administrator.'
      };
    }

    if (user.password !== trimmedPass) {
      return { success: false, error: 'Invalid password. Please verify credentials.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  logout() {
    this.setCurrentUser(null);
  }

  // Admin-only user provisioning
  async createUser({ name, email, password, role, title }) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();
    const trimmedPass = (password || '').trim();
    const targetRole = role === 'admin' ? 'admin' : 'user';

    if (!trimmedName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'A valid corporate email address is required.' };
    }
    if (!trimmedPass || trimmedPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, error: `An account with email "${trimmedEmail}" already exists.` };
    }

    const newUser = {
      id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPass,
      role: targetRole,
      title: (title || '').trim() || (targetRole === 'admin' ? 'System Administrator' : 'Licensing Specialist'),
      createdAt: new Date().toISOString(),
      isRoot: false,
      isActive: true
    };

    const updated = [newUser, ...users];
    this.saveUsers(updated);

    // Push to Neon PostgreSQL via Cloudflare API
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            title: newUser.title,
            is_root: false,
            is_active: true
          }
        })
      }).catch(() => {});
    } catch {}

    return { success: true, user: newUser };
  }

  async updateUser(userId, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    const target = users[index];
    const updatedUser = {
      ...target,
      name: updates.name ? updates.name.trim() : target.name,
      role: updates.role ? (updates.role === 'admin' ? 'admin' : 'user') : target.role,
      title: updates.title !== undefined ? updates.title.trim() : target.title,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : target.isActive
    };

    users[index] = updatedUser;
    this.saveUsers(users);

    // Push to Neon
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            password: updatedUser.password,
            role: updatedUser.role,
            title: updatedUser.title,
            is_root: Boolean(updatedUser.isRoot),
            is_active: updatedUser.isActive !== false
          }
        })
      }).catch(() => {});
    } catch {}

    return { success: true, user: updatedUser };
  }

  async deleteUser(userId, currentAdminId) {
    const users = this.getUsers();
    const target = users.find(u => u.id === userId);

    if (!target) {
      return { success: false, error: 'User not found.' };
    }

    if (target.isRoot) {
      return { success: false, error: 'Cannot delete the primary root administrator account.' };
    }

    if (target.id === currentAdminId) {
      return { success: false, error: 'Cannot delete your own active administrator account while logged in.' };
    }

    const updated = users.filter(u => u.id !== userId);
    this.saveUsers(updated);

    // Push delete to Neon
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId })
      }).catch(() => {});
    } catch {}

    return { success: true };
  }

  async updateUserPassword(userId, newPassword) {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    users[index].password = newPassword.trim();
    this.saveUsers(users);

    // Push password update to Neon
    try {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_password',
          userId,
          newPassword: newPassword.trim()
        })
      }).catch(() => {});
    } catch {}

    return { success: true };
  }

  // RBAC Permission Checkers
  canDeleteIP(user) {
    return Boolean(user && user.role === 'admin');
  }

  canAccessAdminPanel(user) {
    return Boolean(user && user.role === 'admin');
  }

  canPerformOperationalTasks(user) {
    return Boolean(user && (user.role === 'user' || user.role === 'admin'));
  }
}

export const authService = new AuthService();
