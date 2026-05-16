import User from '../models/User.js'
import AuditLog from '../models/AuditLog.js'
import { sendEmail } from '../utils/email.js'

// GET /api/users/:id/approve?action=approve
export const approveUserFromEmail = async (req, res, next) => {
  try {
    const { id } = req.params
    const { action } = req.query

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).send('User not found')
    }

    if (action === 'approve') {
      user.status = 'approved'
      await user.save()

      await AuditLog.create({
        action: 'APPROVED_USER_EMAIL',
        details: `Approved user ${user.name} (${user.empId}) via email link.`
      })

      const html = `
        <h3>Account Approved</h3>
        <p>Hi ${user.name}, your FieldSync account has been approved. You can now log in.</p>
      `
      await sendEmail(user.email, 'FieldSync Account Approved', html)

      res.send('<h1 style="color: green;">User Approved Successfully</h1><p>The worker has been notified.</p>')
    } else if (action === 'reject') {
      user.status = 'rejected'
      await user.save()

      await AuditLog.create({
        action: 'REJECTED_USER_EMAIL',
        details: `Rejected user ${user.name} (${user.empId}) via email link.`
      })

      res.send('<h1 style="color: red;">User Rejected</h1>')
    } else {
      res.status(400).send('Invalid action')
    }
  } catch (error) {
    next(error)
  }
}

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).populate('assignedProjects', 'name code')
    res.json(users)
  } catch (error) {
    next(error)
  }
}

// PUT /api/users/:id/projects
export const assignProjects = async (req, res, next) => {
  try {
    const { id } = req.params
    const { projects } = req.body // array of project object IDs

    const user = await User.findById(id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    user.assignedProjects = projects
    await user.save()

    await AuditLog.create({
      adminId: req.user._id,
      action: 'ASSIGNED_PROJECTS',
      details: `Assigned ${projects.length} projects to user ${user.name} (${user.empId}).`
    })

    res.json(user)
  } catch (error) {
    next(error)
  }
}

// PUT /api/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const user = await User.findById(id)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    user.status = status
    await user.save()

    await AuditLog.create({
      adminId: req.user._id,
      action: status === 'approved' ? 'APPROVED_USER' : 'REJECTED_USER',
      details: `Admin set status of user ${user.name} (${user.empId}) to ${status}.`
    })

    if (status === 'approved') {
      const html = `
        <h3>Account Approved</h3>
        <p>Hi ${user.name}, your FieldSync account has been approved by an Admin. You can now log in.</p>
      `
      await sendEmail(user.email, 'FieldSync Account Approved', html)
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}
