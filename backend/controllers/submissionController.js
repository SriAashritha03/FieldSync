import Submission from '../models/Submission.js'
import User from '../models/User.js'

const parseJson = (value, fallback = {}) => {
  if (!value) {
    return fallback
  }

  if (typeof value === 'object') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value === 'true' || value === '1' || value === 'yes'
  }
  return false
}

const parseDate = (value) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const parseArray = (value) => {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean)
      }
    } catch (error) {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    }
  }
  return []
}

const buildSearchFilter = (search) => {
  if (!search) {
    return null
  }

  const regex = new RegExp(search, 'i')
  return {
    $or: [
      { region: regex },
      { activityType: regex },
      { issues: regex },
      { notes: regex },
      { 'beneficiary.identifier': regex },
      { 'beneficiary.name': regex },
      { 'beneficiary.address': regex },
      { 'beneficiary.village': regex },
      { 'project.code': regex },
      { 'project.name': regex },
      { 'feedback.qualitative': regex },
      { 'staff.staffName': regex },
    ],
  }
}

export const createSubmission = async (req, res, next) => {
  try {
    const {
      region,
      activityType,
      beneficiaryCount,
      issues,
      notes,
      activityDate,
      workerId,
      beneficiaryId,
      beneficiaryName,
      beneficiaryAge,
      beneficiaryDob,
      beneficiaryGender,
      socioeconomicStatus,
      phonePrimary,
      phoneSecondary,
      address,
      village,
      vulnerabilityStatus,
      consentGiven,
      projectCode,
      projectName,
      itemsDistributed,
      trainingHours,
      fundsDisbursed,
      targetBeneficiaries,
      qualitativeFeedback,
      satisfactionLevel,
      staffId,
      staffName,
      geoLat,
      geoLng,
      geoAccuracy,
      geoCapturedAt,
      offlineStatus,
      syncedAt,
    } = req.body

    if (!region || !activityType || beneficiaryCount === undefined || !activityDate) {
      res.status(400)
      throw new Error('Required fields are missing')
    }

    const parsedCount = Number(beneficiaryCount)
    if (Number.isNaN(parsedCount) || parsedCount < 0) {
      res.status(400)
      throw new Error('Beneficiary count must be a positive number')
    }

    const dateValue = parseDate(activityDate)
    if (!dateValue) {
      res.status(400)
      throw new Error('Activity date is invalid')
    }

    const beneficiaryPayload = parseJson(req.body.beneficiary, {})
    const projectPayload = parseJson(req.body.project, {})
    const metricsPayload = parseJson(req.body.metrics, {})
    const feedbackPayload = parseJson(req.body.feedback, {})
    const staffPayload = parseJson(req.body.staff, {})
    const geoPayload = parseJson(req.body.geo, {})
    const offlinePayload = parseJson(req.body.offlineStatus, {})

    const consentValue = parseBoolean(
      beneficiaryPayload.consentGiven ?? consentGiven
    )
    const beneficiaryIdentifier =
      beneficiaryPayload.identifier || beneficiaryId || ''
    const beneficiaryNameValue = beneficiaryPayload.name || beneficiaryName || ''
    const beneficiaryGenderValue =
      beneficiaryPayload.gender || beneficiaryGender || ''

    if (!beneficiaryIdentifier || !beneficiaryNameValue || !beneficiaryGenderValue) {
      res.status(400)
      throw new Error('Beneficiary identifier, name, and gender are required')
    }

    const projectCodeValue = projectPayload.code || projectCode || ''
    if (!projectCodeValue) {
      res.status(400)
      throw new Error('Project code is required')
    }

    if (!consentValue) {
      res.status(400)
      throw new Error('Consent is required before submission')
    }

    let ownerId = req.user._id
    if (req.user.role === 'admin' && workerId) {
      const workerExists = await User.exists({ _id: workerId })
      if (!workerExists) {
        res.status(400)
        throw new Error('Worker not found')
      }
      ownerId = workerId
    }

    const ageValue = parseNumber(
      beneficiaryPayload.age ?? beneficiaryAge
    )
    const dobValue = parseDate(
      beneficiaryPayload.dateOfBirth ?? beneficiaryDob
    )
    const geoLatValue = parseNumber(geoPayload.lat ?? geoLat)
    const geoLngValue = parseNumber(geoPayload.lng ?? geoLng)
    const geoAccuracyValue = parseNumber(geoPayload.accuracy ?? geoAccuracy)
    const geoCapturedAtValue = parseDate(
      geoPayload.capturedAt ?? geoCapturedAt
    )

    const submission = await Submission.create({
      worker: ownerId,
      region,
      activityType,
      beneficiaryCount: parsedCount,
      issues: issues || '',
      notes: notes || '',
      activityDate: dateValue,
      beneficiary: {
        identifier: beneficiaryIdentifier,
        name: beneficiaryNameValue,
        age: ageValue ?? undefined,
        dateOfBirth: dobValue ?? undefined,
        gender: beneficiaryGenderValue,
        socioeconomicStatus:
          beneficiaryPayload.socioeconomicStatus || socioeconomicStatus || '',
        phonePrimary: beneficiaryPayload.phonePrimary || phonePrimary || '',
        phoneSecondary: beneficiaryPayload.phoneSecondary || phoneSecondary || '',
        address: beneficiaryPayload.address || address || '',
        village: beneficiaryPayload.village || village || '',
        vulnerabilityStatus: parseArray(
          beneficiaryPayload.vulnerabilityStatus ?? vulnerabilityStatus
        ),
        consentGiven: consentValue,
      },
      project: {
        code: projectCodeValue,
        name: projectPayload.name || projectName || '',
      },
      metrics: {
        itemsDistributed:
          parseNumber(metricsPayload.itemsDistributed ?? itemsDistributed) || 0,
        trainingHours:
          parseNumber(metricsPayload.trainingHours ?? trainingHours) || 0,
        fundsDisbursed:
          parseNumber(metricsPayload.fundsDisbursed ?? fundsDisbursed) || 0,
        targetBeneficiaries:
          parseNumber(metricsPayload.targetBeneficiaries ?? targetBeneficiaries) ||
          0,
      },
      feedback: {
        qualitative:
          feedbackPayload.qualitative || qualitativeFeedback || '',
        satisfaction:
          feedbackPayload.satisfaction || satisfactionLevel || '',
      },
      staff: {
        staffId: staffPayload.staffId || staffId || req.user._id?.toString() || '',
        staffName: staffPayload.staffName || staffName || req.user.name || '',
      },
      geo: {
        lat: geoLatValue ?? undefined,
        lng: geoLngValue ?? undefined,
        accuracy: geoAccuracyValue ?? undefined,
        capturedAt: geoCapturedAtValue ?? undefined,
      },
      offlineStatus: {
        isOffline: parseBoolean(offlinePayload.isOffline ?? offlineStatus),
        syncedAt: parseDate(offlinePayload.syncedAt ?? syncedAt) ?? undefined,
      },
      media: (req.files || []).map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      })),
    })

    res.status(201).json(submission)
  } catch (error) {
    next(error)
  }
}

export const getSubmissions = async (req, res, next) => {
  try {
    const {
      search,
      region,
      activityType,
      from,
      to,
      limit,
      projectCode,
      beneficiaryId,
      workerId,
    } = req.query
    const filter = {}

    if (req.user.role !== 'admin') {
      filter.worker = req.user._id
    } else if (workerId) {
      filter.worker = workerId
    }

    if (region) {
      filter.region = new RegExp(region, 'i')
    }

    if (activityType) {
      filter.activityType = new RegExp(activityType, 'i')
    }

    if (projectCode) {
      filter['project.code'] = new RegExp(projectCode, 'i')
    }

    if (beneficiaryId) {
      filter['beneficiary.identifier'] = new RegExp(beneficiaryId, 'i')
    }

    if (from || to) {
      filter.activityDate = {}
      if (from) {
        filter.activityDate.$gte = new Date(from)
      }
      if (to) {
        filter.activityDate.$lte = new Date(to)
      }
    }

    const searchFilter = buildSearchFilter(search)
    if (searchFilter) {
      Object.assign(filter, searchFilter)
    }

    let query = Submission.find(filter)
      .sort({ activityDate: -1 })
      .populate('worker', 'name email role region')

    if (limit) {
      query = query.limit(Number(limit))
    }

    const submissions = await query
    res.json(submissions)
  } catch (error) {
    next(error)
  }
}

export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      'worker',
      'name email role region'
    )

    if (!submission) {
      res.status(404)
      throw new Error('Submission not found')
    }

    const workerId = submission.worker?._id?.toString()
    if (req.user.role !== 'admin' && workerId !== req.user._id.toString()) {
      res.status(403)
      throw new Error('Forbidden')
    }

    res.json(submission)
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404)
    }
    next(error)
  }
}

export const getMetrics = async (req, res, next) => {
  try {
    const match = req.user.role === 'admin' ? {} : { worker: req.user._id }
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const totalSubmissions = await Submission.countDocuments(match)
    const totalBeneficiariesAgg = await Submission.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$beneficiaryCount' } } },
    ])
    const totalBeneficiaries = totalBeneficiariesAgg[0]?.total || 0
    const uniqueBeneficiariesList = await Submission.distinct(
      'beneficiary.identifier',
      match
    )
    const uniqueBeneficiaries = uniqueBeneficiariesList.filter(Boolean).length
    const totalFundsAgg = await Submission.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$metrics.fundsDisbursed' } } },
    ])
    const totalFunds = totalFundsAgg[0]?.total || 0
    const totalTargetAgg = await Submission.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$metrics.targetBeneficiaries' } } },
    ])
    const totalTarget = totalTargetAgg[0]?.total || 0
    const recentSubmissions = await Submission.countDocuments({
      ...match,
      activityDate: { $gte: weekAgo },
    })

    const regionStats = await Submission.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          beneficiaries: { $sum: '$beneficiaryCount' },
        },
      },
      { $sort: { count: -1 } },
    ])

    const activityStats = await Submission.aggregate([
      { $match: match },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const geoStats = await Submission.aggregate([
      {
        $match: {
          ...match,
          'geo.lat': { $ne: null },
          'geo.lng': { $ne: null },
        },
      },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          avgLat: { $avg: '$geo.lat' },
          avgLng: { $avg: '$geo.lng' },
        },
      },
      { $sort: { count: -1 } },
    ])

    res.json({
      totalSubmissions,
      totalBeneficiaries,
      uniqueBeneficiaries,
      totalFunds,
      totalTarget,
      recentSubmissions,
      topRegion: regionStats[0] || null,
      topActivity: activityStats[0] || null,
      regionStats,
      activityStats,
      geoStats,
    })
  } catch (error) {
    next(error)
  }
}
