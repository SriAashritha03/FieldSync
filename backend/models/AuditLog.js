import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., 'APPROVED_USER', 'CREATED_PROJECT', 'ASSIGNED_PROJECT'
    details: { type: String, required: true }, // Description of the action
  },
  { timestamps: true }
)

export default mongoose.model('AuditLog', auditLogSchema)
