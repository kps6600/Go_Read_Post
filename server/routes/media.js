import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import Media from '../models/Media.js';
import { isDbConnected } from '../db.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary if credentials exist
const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary integration active');
}

// 1. GET /api/media (List & Search media files)
router.get('/', async (req, res) => {
  try {
    const query = (req.query.q || req.query.search || '').trim();
    const mediaType = req.query.type; // 'image' or 'video'

    if (isDbConnected()) {
      let filter = {};
      if (query) {
        filter.$or = [
          { filename: new RegExp(query, 'i') },
          { altText: new RegExp(query, 'i') },
          { caption: new RegExp(query, 'i') }
        ];
      }
      if (mediaType && (mediaType === 'image' || mediaType === 'video')) {
        filter.mediaType = mediaType;
      }

      const mediaDocs = await Media.find(filter).sort({ createdAt: -1 });
      if (mediaDocs.length > 0) {
        return res.json({ success: true, count: mediaDocs.length, data: mediaDocs });
      }
    }

    // Local filesystem scan fallback
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(uploadsDir);
    let mediaList = files
      .filter(file => !file.startsWith('.'))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(file);
        return {
          _id: `media_${file}`,
          filename: file,
          originalName: file,
          url: `/uploads/${file}`,
          size: stats.size,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
          mediaType: isVideo ? 'video' : 'image',
          isImage: !isVideo,
          provider: 'local'
        };
      });

    if (query) {
      mediaList = mediaList.filter(m => m.filename.toLowerCase().includes(query.toLowerCase()));
    }
    if (mediaType) {
      mediaList = mediaList.filter(m => m.mediaType === mediaType);
    }

    res.json({ success: true, count: mediaList.length, data: mediaList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /api/media/upload (Image & Video Upload with Cloudinary & Local support)
router.post('/upload', protectAdmin, async (req, res) => {
  try {
    const { base64Data, filename, altText, caption, credit } = req.body;

    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'base64Data media payload is required' });
    }

    // Parse mime type & base64
    const matches = base64Data.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
    let ext = 'png';
    let mime = 'image/png';
    let isVideo = false;
    let dataBuffer;

    if (matches && matches.length === 3) {
      mime = matches[1];
      dataBuffer = Buffer.from(matches[2], 'base64');
      if (mime.includes('video') || mime.includes('mp4')) {
        ext = 'mp4';
        isVideo = true;
      } else if (mime.includes('webm')) {
        ext = 'webm';
        isVideo = true;
      } else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('gif')) ext = 'gif';
    } else {
      dataBuffer = Buffer.from(base64Data, 'base64');
    }

    let fileUrl = '';
    let publicId = '';
    let provider = 'local';
    const cleanName = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_') : (isVideo ? 'video' : 'upload')) + '_' + Date.now() + '.' + ext;

    // Check Cloudinary
    if (hasCloudinary) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64Data,
            {
              resource_type: isVideo ? 'video' : 'image',
              folder: 'goreadpost_media'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });

        fileUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        provider = 'cloudinary';
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning, falling back to local file storage:', cloudErr.message);
      }
    }

    // Local storage fallback
    if (!fileUrl) {
      const destPath = path.join(uploadsDir, cleanName);
      fs.writeFileSync(destPath, dataBuffer);
      fileUrl = `/uploads/${cleanName}`;
      provider = 'local';
    }

    const mediaPayload = {
      filename: cleanName,
      url: fileUrl,
      mediaType: isVideo ? 'video' : 'image',
      type: mime,
      size: dataBuffer.length,
      altText: altText || filename || '',
      caption: caption || '',
      credit: credit || 'GoReadPost Media',
      provider,
      publicId,
      uploadedBy: req.admin?.username || 'admin'
    };

    if (isDbConnected()) {
      const newMedia = await Media.create(mediaPayload);
      return res.status(201).json({
        success: true,
        message: 'Media uploaded and saved to MongoDB library',
        data: newMedia
      });
    }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        _id: `media_${cleanName}`,
        ...mediaPayload,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. DELETE /api/media/:id (Delete media record and file)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let doc = null;
      if (mongoose.isValidObjectId(id)) {
        doc = await Media.findById(id);
      }
      if (!doc) {
        doc = await Media.findOne({ filename: id });
      }

      if (doc) {
        if (doc.provider === 'cloudinary' && doc.publicId && hasCloudinary) {
          await cloudinary.uploader.destroy(doc.publicId, { resource_type: doc.mediaType });
        } else if (doc.url.startsWith('/uploads/')) {
          const localFile = path.join(uploadsDir, path.basename(doc.url));
          if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
        }
        await Media.deleteOne({ _id: doc._id });
        return res.json({ success: true, message: 'Media record removed from MongoDB and storage' });
      }
    }

    // Fallback: Check local filesystem by filename
    const safeFilename = path.basename(id);
    const targetPath = path.join(uploadsDir, safeFilename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return res.json({ success: true, message: 'File deleted from local storage' });
    }

    res.json({ success: true, message: 'Media reference removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/media/bulk-delete (Bulk delete media assets)
router.post('/bulk-delete', protectAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of media IDs is required' });
    }

    if (isDbConnected()) {
      const validObjectIds = ids.filter(id => mongoose.isValidObjectId(id));
      const filenames = ids.map(id => String(id));

      const queryConditions = [{ filename: { $in: filenames } }];
      if (validObjectIds.length > 0) {
        queryConditions.push({ _id: { $in: validObjectIds } });
      }

      const docs = await Media.find({ $or: queryConditions });
      for (const doc of docs) {
        try {
          if (doc.provider === 'cloudinary' && doc.publicId && hasCloudinary) {
            await cloudinary.uploader.destroy(doc.publicId, { resource_type: doc.mediaType });
          } else if (doc.url.startsWith('/uploads/')) {
            const localFile = path.join(uploadsDir, path.basename(doc.url));
            if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
          }
        } catch (e) {}
      }

      const result = await Media.deleteMany({ $or: queryConditions });
      return res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} media files`,
        deletedCount: result.deletedCount
      });
    }

    // Local fallback
    for (const id of ids) {
      try {
        const safeFilename = path.basename(id);
        const targetPath = path.join(uploadsDir, safeFilename);
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      } catch (e) {}
    }
    res.json({ success: true, message: `Successfully deleted ${ids.length} media files` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
