import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Super Admin'
    },
    role: {
      type: String,
      enum: ['superadmin', 'editor'],
      default: 'superadmin'
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

// Method to verify password
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
