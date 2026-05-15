import express from 'express'
import { getInsights, getSummary } from '../controllers/reportController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/summary', protect, requireRole('admin'), getSummary)
router.get('/insights', protect, requireRole('admin'), getInsights)

export default router
