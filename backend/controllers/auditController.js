import AuditLog from '../models/AuditLog.js'

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate('adminId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100) // limit to 100 recent logs
    res.json(logs)
  } catch (error) {
    next(error)
  }
}
