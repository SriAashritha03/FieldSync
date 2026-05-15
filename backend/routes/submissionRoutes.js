import express from 'express'
import {
  createSubmission,
  getSubmissionById,
  getMetrics,
  getSubmissions,
} from '../controllers/submissionController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router
  .route('/')
  .post(protect, upload.array('media', 5), createSubmission)
  .get(protect, getSubmissions)
router.get('/metrics', protect, getMetrics)
router.get('/:id', protect, getSubmissionById)

export default router
