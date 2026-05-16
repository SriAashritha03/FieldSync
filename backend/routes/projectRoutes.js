import express from 'express'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

// Workers can GET projects
router.get('/', getProjects)

// Only Admins can create, update, delete
router.post('/', requireRole('admin'), createProject)
router.put('/:id', requireRole('admin'), updateProject)
router.delete('/:id', requireRole('admin'), deleteProject)

export default router
