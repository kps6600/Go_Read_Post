import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    designation: { type: String, default: 'Staff Reporter' },
    socialLinks: {
      linkedin: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
      github: { type: String, default: '' }
    },
    email: { type: String, default: '' },
    password: { type: String, default: 'Author@12345' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Author || mongoose.model('Author', authorSchema);
