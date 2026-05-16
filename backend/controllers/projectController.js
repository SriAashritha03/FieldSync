import Project from '../models/Project.js'
import AuditLog from '../models/AuditLog.js'

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({})
    res.json(projects)
  } catch (error) {
    next(error)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const { name, code, description, status } = req.body

    const project = await Project.create({ name, code, description, status })

    await AuditLog.create({
      adminId: req.user._id,
      action: 'CREATED_PROJECT',
      details: `Created project ${name} (${code}).`
    })

    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, code, description, status } = req.body

    const project = await Project.findById(id)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    project.name = name || project.name
    project.code = code || project.code
    project.description = description || project.description
    project.status = status || project.status

    await project.save()

    await AuditLog.create({
      adminId: req.user._id,
      action: 'UPDATED_PROJECT',
      details: `Updated project ${project.name} (${project.code}).`
    })

    res.json(project)
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const project = await Project.findById(id)

    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }

    await project.deleteOne()

    await AuditLog.create({
      adminId: req.user._id,
      action: 'DELETED_PROJECT',
      details: `Deleted project ${project.name} (${project.code}).`
    })

    res.json({ message: 'Project removed' })
  } catch (error) {
    next(error)
  }
}
