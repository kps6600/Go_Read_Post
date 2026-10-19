import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role, { DEFAULT_ROLES } from '../models/Role.js';
import Admin from '../models/Admin.js';
import { isDbConnected } from '../db.js';
import { protectAdmin, protectAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'goreadpost_cms_super_secret_jwt_key_2026_prod';

// Helper to seed default roles & super admin
export async function ensureDefaultAdmin() {
  try {
    if (!isDbConnected()) return;

    // 1. Seed Roles
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      await Role.insertMany(DEFAULT_ROLES);
      console.log('🛡️ Seeded default system roles (SUPER_ADMIN, ADMIN, EDITOR, AUTHOR)');
    }

    // 2. Seed Default Super Admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultSalt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', defaultSalt);
      await User.create({
        username: 'admin',
        email: 'admin@goreadpost.com',
        passwordHash: hashedPassword,
        name: 'Super Administrator',
        role: 'SUPER_ADMIN'
      });

      // Also ensure compatibility with legacy Admin model
      await Admin.create({
        username: 'admin',
        email: 'admin@goreadpost.com',
        passwordHash: hashedPassword,
        name: 'Super Administrator',
        role: 'SUPER_ADMIN'
      }).catch(() => {});

      console.log('🔐 Seeded default Super Admin credentials (admin@goreadpost.com / Admin@12345)');
    }
  } catch (err) {
    console.error('Error seeding default admin/roles:', err.message);
  }
}

// 1. POST /api/auth/register (Public User Registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let { username } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (!username || !username.trim()) {
      const baseName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      username = `${baseName}_${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      username = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }

    if (isDbConnected()) {
      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email: cleanEmail }, { username }]
      });

      if (existingUser) {
        if (existingUser.email === cleanEmail) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email address already exists. Please log in.'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'This username is already taken. Please try another.'
        });
      }

      // Hash password
      const passwordHash = await User.hashPassword(password);

      // Create reader user
      const newUser = await User.create({
        name: name.trim(),
        username,
        email: cleanEmail,
        passwordHash,
        role: 'READER',
        isActive: true,
        lastLogin: new Date()
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatar: newUser.avatar || ''
        }
      });
    } else {
      // Local fallback registration
      const fakeId = `local_user_${Date.now()}`;
      const token = jwt.sign(
        { id: fakeId, username, email: cleanEmail, role: 'READER' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account registered in local mode!',
        token,
        user: {
          id: fakeId,
          username,
          email: cleanEmail,
          name: name.trim(),
          role: 'READER',
          avatar: ''
        }
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error occurred during registration.'
    });
  }
});

// 2. POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const login = (req.body.login || req.body.email || req.body.username || '').trim();
    const password = req.body.password;
    const portal = req.body.portal || 'public'; // 'admin' | 'public'

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.'
      });
    }

    const cleanLogin = login.trim().toLowerCase();

    // Check MongoDB connection
    if (isDbConnected()) {
      await ensureDefaultAdmin();

      // Find in User collection first, fallback to Admin collection
      let user = await User.findOne({
        $or: [{ email: cleanLogin }, { username: cleanLogin }]
      });

      if (!user) {
        user = await Admin.findOne({
          $or: [{ email: cleanLogin }, { username: cleanLogin }]
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User does not exist.'
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Incorrect password.'
        });
      }

      user.lastLogin = new Date();
      await user.save().catch(() => {});

      const normalizedRole = (user.role || 'READER').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
      const isAssignedAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(normalizedRole);

      // SECURITY RULE: Super Admin and staff accounts CANNOT log in through the public reader portal.
      // Super admin can only log in through the Admin Panel.
      if (portal === 'public' && isAssignedAdmin) {
        return res.status(403).json({
          success: false,
          isSuperAdminAttempt: true,
          message: 'Super Administrator and Staff accounts cannot sign in through the public reader portal. Super Admin can only log in through the Admin Panel.'
        });
      }

      // SECURITY RULE: Normal users (e.g. READER, AUTHOR) cannot log in to the Admin Panel.
      if (portal === 'admin' && !isAssignedAdmin) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Only assigned administrators can access the Admin Panel. Account "${user.name || user.username}" (${normalizedRole}) lacks administrative privileges.`
        });
      }

      // Sign JWT
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          role: normalizedRole
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          avatar: user.avatar || '',
          bio: user.bio || '',
          lastLogin: user.lastLogin
        },
        admin: isAssignedAdmin ? {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: normalizedRole,
          lastLogin: user.lastLogin
        } : null
      });
    } else {
      // Offline fallback login check
      if ((cleanLogin === 'admin' || cleanLogin === 'admin@goreadpost.com') && password === 'Admin@12345') {
        if (portal === 'public') {
          return res.status(403).json({
            success: false,
            isSuperAdminAttempt: true,
            message: 'Super Administrator accounts cannot sign in through the public reader portal. Super Admin can only log in through the Admin Panel.'
          });
        }

        const token = jwt.sign(
          {
            id: 'fallback_admin_id',
            username: 'admin',
            email: 'admin@goreadpost.com',
            role: 'SUPER_ADMIN'
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          message: 'Authenticated in local fallback mode',
          token,
          user: {
            id: 'fallback_admin_id',
            username: 'admin',
            email: 'admin@goreadpost.com',
            name: 'Super Administrator',
            role: 'SUPER_ADMIN'
          },
          admin: {
            id: 'fallback_admin_id',
            username: 'admin',
            email: 'admin@goreadpost.com',
            name: 'Super Administrator (Local Mode)',
            role: 'SUPER_ADMIN',
            lastLogin: new Date()
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: portal === 'admin' 
          ? 'Invalid administrator credentials in local mode.' 
          : 'Invalid credentials in local mode.'
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during login. Please try again.'
    });
  }
});

// 3. GET /api/auth/me (Current Authenticated User)
router.get('/me', protectAuth, async (req, res) => {
  try {
    if (isDbConnected()) {
      let user = await User.findById(req.user.id || req.user._id).select('-passwordHash');
      if (!user) {
        user = await Admin.findById(req.user.id || req.user._id).select('-passwordHash');
      }
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const role = (user.role || 'READER').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
      const isAssignedAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);
      return res.json({ success: true, user, admin: isAssignedAdmin ? user : null });
    }
    const role = (req.user?.role || 'READER').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
    const isAssignedAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(role);
    res.json({ success: true, user: req.user, admin: isAssignedAdmin ? req.user : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. PUT /api/auth/profile (Update Profile)
router.put('/profile', protectAdmin, async (req, res) => {
  try {
    const { name, bio, avatar, phone } = req.body;
    if (isDbConnected()) {
      const user = await User.findById(req.user.id || req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      if (name) user.name = name.trim();
      if (bio !== undefined) user.bio = bio.trim();
      if (avatar !== undefined) user.avatar = avatar.trim();
      if (phone !== undefined) user.phone = phone.trim();

      await user.save();
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone
        }
      });
    }
    res.json({ success: true, message: 'Profile updated (mock mode)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /api/auth/change-password (Change Password)
router.put('/change-password', protectAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    if (isDbConnected()) {
      const user = await User.findById(req.user.id || req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.passwordHash = await User.hashPassword(newPassword);
      await user.save();
      return res.json({ success: true, message: 'Password changed successfully!' });
    }
    res.json({ success: true, message: 'Password changed (mock mode)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Successfully logged out' });
});

// 7. GET /api/auth/bookmarks (Get current user's saved stories)
router.get('/bookmarks', protectAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (isDbConnected() && userId) {
      const user = await User.findById(userId);
      if (user) {
        return res.json({
          success: true,
          count: user.savedArticles ? user.savedArticles.length : 0,
          bookmarks: user.savedArticles || []
        });
      }
    }
    res.json({ success: true, count: 0, bookmarks: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. POST /api/auth/bookmarks/toggle (Toggle bookmark for current user)
router.post('/bookmarks/toggle', protectAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { story } = req.body;
    if (!story) {
      return res.status(400).json({ success: false, message: 'Story payload is required' });
    }

    const storyId = String(story.id || story._id || story.slug);

    if (isDbConnected() && userId) {
      const user = await User.findById(userId);
      if (user) {
        if (!Array.isArray(user.savedArticles)) {
          user.savedArticles = [];
        }

        const existingIndex = user.savedArticles.findIndex(s => {
          if (!s) return false;
          if (typeof s === 'string') return String(s) === storyId;
          return String(s.id) === storyId || String(s._id) === storyId || String(s.slug) === storyId;
        });

        let isSaved = false;
        if (existingIndex >= 0) {
          // Remove
          user.savedArticles.splice(existingIndex, 1);
          isSaved = false;
        } else {
          // Add clean story preview object
          const sanitized = {
            id: storyId,
            _id: story._id || storyId,
            title: story.title || 'Untitled Story',
            summary: story.summary || story.subtitle || '',
            image: story.image || story.coverImage || '',
            category: story.category || 'General',
            categoryLabel: story.categoryLabel || story.category || 'General',
            readTime: story.readTime || '4 min read',
            slug: story.slug || storyId,
            author: story.author || null,
            publishedAt: story.publishedAt || story.date || new Date().toISOString()
          };
          user.savedArticles.unshift(sanitized);
          isSaved = true;
        }

        user.markModified('savedArticles');
        await user.save();

        return res.json({
          success: true,
          saved: isSaved,
          count: user.savedArticles.length,
          bookmarks: user.savedArticles
        });
      }
    }

    res.json({ success: true, saved: true, bookmarks: [story] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. POST /api/auth/bookmarks/sync (Sync full bookmarks array for current user)
router.post('/bookmarks/sync', protectAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { bookmarks } = req.body;
    if (!Array.isArray(bookmarks)) {
      return res.status(400).json({ success: false, message: 'Bookmarks array is required' });
    }

    if (isDbConnected() && userId) {
      const user = await User.findById(userId);
      if (user) {
        user.savedArticles = bookmarks;
        user.markModified('savedArticles');
        await user.save();
        return res.json({
          success: true,
          count: user.savedArticles.length,
          bookmarks: user.savedArticles
        });
      }
    }
    res.json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. DELETE /api/auth/bookmarks (Delete one or all bookmarks for current user)
router.delete('/bookmarks', protectAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const storyId = req.body?.storyId || req.query?.storyId;

    if (isDbConnected() && userId) {
      const user = await User.findById(userId);
      if (user) {
        if (storyId) {
          const target = String(storyId);
          user.savedArticles = (user.savedArticles || []).filter(s => {
            if (!s) return false;
            if (typeof s === 'string') return String(s) !== target;
            return String(s.id) !== target && String(s._id) !== target && String(s.slug) !== target;
          });
        } else {
          user.savedArticles = [];
        }
        user.markModified('savedArticles');
        await user.save();
        return res.json({
          success: true,
          message: storyId ? 'Removed from saved stories' : 'All saved stories cleared',
          count: user.savedArticles.length,
          bookmarks: user.savedArticles
        });
      }
    }
    res.json({ success: true, bookmarks: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
