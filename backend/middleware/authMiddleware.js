import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401)
      throw new Error('Not authorized, token missing')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      res.status(401)
      throw new Error('Not authorized, user not found')
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403)
    throw new Error('Forbidden')
  }

  next()
}
