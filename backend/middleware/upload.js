import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase()
    const ext = path.extname(safeName)
    const base = safeName.replace(ext, '')
    cb(null, `${base}-${timestamp}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true)
  } else {
    cb(new Error('Only images or videos are allowed'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})
