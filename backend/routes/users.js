import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role, { DEFAULT_ROLES } from '../models/Role.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, requireSuperAdmin, requireRoles } from '../middleware/auth.js';

const router = express.Router();

// 🔒 Strict RBAC: User management is restricted strictly to Admins and Super Admins
router.use(protectAdmin);
router.use(requireRoles('SUPER_ADMIN', 'ADMIN'));

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
    _id: 'author_user_id',
    name: 'Staff Author',
    username: 'author',
    email: 'author@goreadpost.com',
    role: 'AUTHOR',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sample_user_id',
    name: 'Sample Reader',
    username: 'reader1',
    email: 'reader@example.com',
    role: 'USER',
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
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { name, username, email, password, role, avatar, bio, phone, isActive } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All required fields (name, username, email, password) must be provided.' });
    }

    const validRoles = ['SUPER_ADMIN', 'AUTHOR', 'USER', 'READER'];
    const chosenRole = validRoles.includes((role || '').toUpperCase()) ? (role || '').toUpperCase() : 'USER';

    if (isDbConnected()) {
      const existing = await User.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }]
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'A user with this email or username already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        avatar: avatar || '',
        bio: bio || '',
        phone: phone || '',
        role: chosenRole,
        isActive: typeof isActive === 'boolean' ? isActive : true
      });

      const userDoc = newUser.toObject();
      delete userDoc.passwordHash;

      return res.status(201).json({ success: true, message: 'User created successfully', data: userDoc });
    }

    const mockNew = {
      _id: `user_${Date.now()}`,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      avatar: avatar || '',
      bio: bio || '',
      phone: phone || '',
      role: chosenRole,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdAt: new Date().toISOString()
    };
    fallbackUsers.push(mockNew);
    res.status(201).json({ success: true, message: 'User created (local mode)', data: mockNew });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. PUT /api/admin/users/:id (Update User)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, isActive, password, avatar, bio, phone } = req.body;

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isRootAdmin = targetUser.username === 'admin' || targetUser.email === 'admin@goreadpost.com';

      const updateData = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (avatar !== undefined) updateData.avatar = avatar;
      if (bio !== undefined) updateData.bio = bio;
      if (phone !== undefined) updateData.phone = phone;
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

// 4b. PATCH /api/admin/users/:id/status (Toggle / Update User Status: Active or Suspended)
router.patch('/:id/status', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive boolean is required' });
    }

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isRootAdmin = targetUser.username === 'admin' || targetUser.email === 'admin@goreadpost.com' || targetUser.role === 'SUPER_ADMIN';
      if (isRootAdmin && !isActive) {
        return res.status(400).json({ success: false, message: 'Cannot suspend a Super Administrator account' });
      }

      targetUser.isActive = isActive;
      await targetUser.save();
      const userDoc = targetUser.toObject();
      delete userDoc.passwordHash;

      return res.json({
        success: true,
        message: `Account for ${targetUser.name} has been ${isActive ? 'activated' : 'suspended'}.`,
        data: userDoc
      });
    }

    const idx = fallbackUsers.findIndex(u => u._id === id);
    if (idx !== -1) {
      fallbackUsers[idx].isActive = isActive;
      return res.json({ success: true, message: `Account status updated (local mode)`, data: fallbackUsers[idx] });
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

// 7. POST /api/admin/users/bulk-status (Bulk Activate / Suspend Users)
router.post('/bulk-status', protectAdmin, async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Array of user IDs and isActive boolean are required' });
    }

    if (isDbConnected()) {
      const filter = {
        _id: { $in: ids }
      };
      if (!isActive) {
        filter.username = { $ne: 'admin' };
        filter.email = { $ne: 'admin@goreadpost.com' };
        filter.role = { $ne: 'SUPER_ADMIN' };
      }

      const result = await User.updateMany(filter, { $set: { isActive } });
      return res.json({
        success: true,
        message: `Successfully ${isActive ? 'activated' : 'suspended'} ${result.modifiedCount} accounts`
      });
    }

    fallbackUsers.forEach(u => {
      if (ids.includes(u._id) && !(u.role === 'SUPER_ADMIN' && !isActive)) {
        u.isActive = isActive;
      }
    });
    res.json({ success: true, message: `Successfully ${isActive ? 'activated' : 'suspended'} accounts (local mode)` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
