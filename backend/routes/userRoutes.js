import express from 'express'
import {
  approveUserFromEmail,
  getUsers,
  assignProjects,
  updateUserStatus,
} from '../controllers/userController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Publicly accessible via email link
router.get('/:id/approve', approveUserFromEmail)

// Admin only routes
router.use(protect)
router.use(requireRole('admin'))

router.get('/', getUsers)
router.put('/:id/projects', assignProjects)
router.put('/:id/status', updateUserStatus)

export default router
