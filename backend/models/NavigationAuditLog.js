import mongoose from 'mongoose';

const navigationAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'REORDER', 'STATUS_CHANGE', 'DUPLICATE', 'PUBLISH', 'ARCHIVE', 'RESTORE']
    },
    adminId: { type: String, default: 'system' },
    adminName: { type: String, default: 'Admin' },
    adminEmail: { type: String, default: '' },
    menuId: { type: String, default: '' },
    menuTitle: { type: String, default: '' },
    details: { type: String, default: '' },
    changes: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

navigationAuditLogSchema.index({ timestamp: -1 });
navigationAuditLogSchema.index({ action: 1 });
navigationAuditLogSchema.index({ menuId: 1 });

export default mongoose.models.NavigationAuditLog || mongoose.model('NavigationAuditLog', navigationAuditLogSchema);
