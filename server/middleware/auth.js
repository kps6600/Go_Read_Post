import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { isDbConnected } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'goreadpost_cms_super_secret_jwt_key_2026_prod';

// Middleware: Protect any authenticated user (Readers, Staff, Admins)
export const protectAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication token required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isDbConnected()) {
      let user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        user = await Admin.findById(decoded.id).select('-passwordHash');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found or session invalid.'
        });
      }

      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      req.user = user;
      req.admin = user;
    } else {
      const fallbackUser = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        name: decoded.name || decoded.username,
        role: (decoded.role || 'READER').toUpperCase()
      };
      req.user = fallbackUser;
      req.admin = fallbackUser;
    }

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token.'
    });
  }
};

// Middleware: Protect Admin Endpoints (Only assigned SUPER_ADMIN and ADMIN)
export const protectAdmin = async (req, res, next) => {
  await protectAuth(req, res, () => {
    const role = (req.user?.role || req.admin?.role || '').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
    const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
    
    if (!adminRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only assigned administrators can access the admin panel.'
      });
    }
    next();
  });
};

// Middleware: Require Super Admin Role
export const requireSuperAdmin = (req, res, next) => {
  const role = (req.admin?.role || req.user?.role || '').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
  if (role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super Administrator privileges required.'
    });
  }
  next();
};

// Middleware: Role Based Access Control (RBAC)
export const requireRoles = (...roles) => {
  const allowed = roles.map(r => r.toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN'));
  return (req, res, next) => {
    const userRole = (req.admin?.role || req.user?.role || '').toUpperCase().replace('SUPERADMIN', 'SUPER_ADMIN');
    if (!allowed.includes(userRole) && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] privileges.`
      });
    }
    next();
  };
};
