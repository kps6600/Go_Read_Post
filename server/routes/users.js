import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role, { DEFAULT_ROLES } from '../models/Role.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fallback in-memory users for offline mode
let fallbackUsers = [
  {
    _id: 'default_admin_id',
    name: 'Super Administrator',
    username: 'admin',
    email: 'admin@goreadpost.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'editor_user_id',
    name: 'Senior Editor',
    username: 'editor',
    email: 'editor@goreadpost.com',
    role: 'EDITOR',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'author_user_id',
    name: 'Staff Author',
    username: 'author',
    email: 'author@goreadpost.com',
    role: 'AUTHOR',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// 1. GET /api/admin/users
router.get('/', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    }
    res.json({ success: true, count: fallbackUsers.length, data: fallbackUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/admin/users/roles
router.get('/roles', protectAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      let roles = await Role.find();
      if (!roles || roles.length === 0) {
        roles = await Role.insertMany(DEFAULT_ROLES);
      }
      return res.json({ success: true, data: roles });
    }
    res.json({ success: true, data: DEFAULT_ROLES });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /api/admin/users (Create User)
router.post('/', protectAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields (name, username, email, password) are required.' });
    }

    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'];
    const chosenRole = validRoles.includes((role || '').toUpperCase()) ? (role || '').toUpperCase() : 'AUTHOR';

    if (isDbConnected()) {
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }]
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email or username already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: chosenRole,
        isActive: true
      });

      const userDoc = newUser.toObject();
      delete userDoc.passwordHash;

      return res.status(201).json({ success: true, message: 'User created successfully', data: userDoc });
    }

    const mockNew = {
      _id: `user_${Date.now()}`,
      name,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      role: chosenRole,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    fallbackUsers.push(mockNew);
    res.status(201).json({ success: true, message: 'User created (local mode)', data: mockNew });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. PUT /api/admin/users/:id (Update User)
router.put('/:id', protectAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, isActive, password } = req.body;

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isRootAdmin = targetUser.username === 'admin' || targetUser.email === 'admin@goreadpost.com';

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email.toLowerCase().trim();
      if (role) {
        updateData.role = isRootAdmin ? 'SUPER_ADMIN' : role.toUpperCase();
      }
      if (typeof isActive === 'boolean') {
        updateData.isActive = isRootAdmin ? true : isActive;
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.passwordHash = await bcrypt.hash(password, salt);
      }

      const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
      return res.json({ success: true, message: 'User updated successfully', data: updated });
    }

    const idx = fallbackUsers.findIndex(u => u._id === id);
    if (idx !== -1) {
      fallbackUsers[idx] = { ...fallbackUsers[idx], ...req.body };
      return res.json({ success: true, message: 'User updated (local mode)', data: fallbackUsers[idx] });
    }
    res.status(404).json({ success: false, message: 'User not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. DELETE /api/admin/users/:id
router.delete('/:id', protectAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, message: 'User deleted successfully' });
    }
    fallbackUsers = fallbackUsers.filter(u => u._id !== id);
    res.json({ success: true, message: 'User deleted (local mode)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. POST /api/admin/users/bulk-delete
router.post('/bulk-delete', protectAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of user IDs is required' });
    }

    // Prevent deleting the currently authenticated user
    const currentUserId = String(req.user?.id || req.user?._id || '');
    const filteredIds = ids.filter(id => String(id) !== currentUserId);

    if (filteredIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    if (isDbConnected()) {
      const result = await User.deleteMany({ _id: { $in: filteredIds } });
      return res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} users`,
        deletedCount: result.deletedCount
      });
    }

    const strIds = new Set(filteredIds.map(String));
    fallbackUsers = fallbackUsers.filter(u => !strIds.has(String(u._id)));
    res.json({ success: true, message: `Successfully deleted ${filteredIds.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
