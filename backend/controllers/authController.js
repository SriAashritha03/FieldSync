import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, region } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email, and password are required')
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      res.status(400)
      throw new Error('User already exists')
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'admin' ? 'admin' : 'worker',
      region: region || 'Unassigned',
    })

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400)
      throw new Error('Email and password are required')
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await user.matchPassword(password))) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res) => {
  res.json({ user: req.user })
}
