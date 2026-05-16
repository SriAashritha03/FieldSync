import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendEmail } from '../utils/email.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, region, empId } = req.body

    if (!name || !email || !password || !empId) {
      res.status(400)
      throw new Error('Name, email, password, and empId are required')
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { empId }] })
    if (existing) {
      res.status(400)
      throw new Error('User with this email or empId already exists')
    }

    const desiredRole = role === 'admin' ? 'admin' : 'worker'

    if (desiredRole === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount >= 2) {
        res.status(403)
        throw new Error('Admin limit reached. Only two admins are allowed.')
      }
    }

    const status = desiredRole === 'admin' ? 'approved' : 'pending'

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: desiredRole,
      region: region || 'Unassigned',
      empId,
      status,
    })

    if (desiredRole === 'worker') {
      const admins = await User.find({ role: 'admin' })
      const adminEmails = admins.map(a => a.email).join(', ')
      const backendUrl = process.env.API_URL || 'http://localhost:5000'
      
      if (adminEmails) {
        const html = `
          <h3>New Worker Registration Pending Approval</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Employee ID:</strong> ${user.empId}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p>Please review and approve or reject this user:</p>
          <a href="${backendUrl}/api/users/${user._id}/approve?action=approve" style="padding: 10px 15px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Approve</a>
          <a href="${backendUrl}/api/users/${user._id}/approve?action=reject" style="padding: 10px 15px; background-color: red; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;">Reject</a>
        `
        await sendEmail(adminEmails, 'Action Required: New Worker Registration', html)
      }
    }

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
        empId: user.empId,
        status: user.status,
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

    if (user.status !== 'approved') {
      res.status(403)
      throw new Error(`Account is ${user.status}. Please wait for admin approval.`)
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
