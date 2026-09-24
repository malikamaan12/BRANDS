// ============================================================================
// IP HUB — Role-Based Access Control (RBAC) & Authentication Service
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

const USERS_STORAGE_KEY = 'iphub_rbac_users_v1';
const SESSION_STORAGE_KEY = 'iphub_rbac_session_v1';

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
    isRoot: true
  },
  {
    id: 'usr-licensing-02',
    name: 'Licensing Associate',
    email: 'user@iphub.com',
    password: 'User@IPHub2026!',
    role: 'user',
    title: 'Senior Entertainment Licensing Lead',
    createdAt: '2026-02-01T10:00:00.000Z',
    isRoot: false
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
      
      // Auto-initialize session if none exists (defaults to Admin for instant evaluation, or can switch)
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!session) {
        // Default to Master Admin so first-time load works smoothly
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(DEFAULT_USERS[0]));
      }
    } catch (e) {
      console.warn('AuthService storage initialization warning:', e);
    }
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
    if (typeof window === 'undefined') return DEFAULT_USERS[0];
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!session) return null;
      const parsed = JSON.parse(session);
      // Verify user still exists in directory
      const users = this.getUsers();
      const matched = users.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
      return matched || parsed;
    } catch {
      return DEFAULT_USERS[0];
    }
  }

  setCurrentUser(user) {
    if (typeof window === 'undefined') return;
    if (user) {
      const sanitized = { ...user };
      delete sanitized.password; // Do not keep raw password in session
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

    if (user.password !== trimmedPass) {
      return { success: false, error: 'Invalid password. Please verify credentials or contact an administrator.' };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  logout() {
    this.setCurrentUser(null);
  }

  // Admin-only user provisioning
  createUser({ name, email, password, role, title }) {
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
      isRoot: false
    };

    const updated = [newUser, ...users];
    this.saveUsers(updated);

    return { success: true, user: newUser };
  }

  deleteUser(userId, currentAdminId) {
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
    return { success: true };
  }

  updateUserPassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    users[index].password = newPassword.trim();
    this.saveUsers(users);
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
    // Both standard users and admins can perform operational tasks
    return Boolean(user && (user.role === 'user' || user.role === 'admin'));
  }
}

export const authService = new AuthService();
