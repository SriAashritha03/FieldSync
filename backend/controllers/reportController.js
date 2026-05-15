import { GoogleGenerativeAI } from '@google/generative-ai'
import Submission from '../models/Submission.js'

const getDateRange = (from, to) => {
  const end = to ? new Date(to) : new Date()
  const start = from ? new Date(from) : new Date(end)

  if (!from) {
    start.setDate(start.getDate() - 7)
  }

  return { start, end }
}

const getAiModel = () => {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return null
  }

  const modelName = process.env.GOOGLE_MODEL || 'gemini-1.5-flash'
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.3, maxOutputTokens: 280 },
  })
}

const generateAiText = async (prompt) => {
  const model = getAiModel()
  if (!model) {
    return null
  }

  try {
    const result = await model.generateContent(prompt)
    const text = result?.response?.text?.()
    return text ? text.trim() : null
  } catch (error) {
    console.warn('AI generation failed:', error.message)
    return null
  }
}

const extractJsonArray = (text) => {
  if (!text) {
    return null
  }

  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start === -1 || end === -1) {
    return null
  }

  try {
    const json = text.slice(start, end + 1)
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) {
      return null
    }
    return parsed.filter(
      (item) => typeof item === 'string' && item.trim().length > 0
    )
  } catch (error) {
    return null
  }
}

const buildSummaryPrompt = (stats) => {
  return `You are an NGO reporting assistant. Write a concise 2-3 sentence summary for leadership.
Mention totals, unique reach if provided, top activity, top region, major issue, and funds disbursed.
Use plain text only, no bullet points.
Stats: ${JSON.stringify(stats)}`
}

const buildInsightsPrompt = (stats) => {
  return `You are an NGO analyst. Return a JSON array of 2-4 short, actionable insights.
Keep each insight under 18 words. Use plain strings only.
Stats: ${JSON.stringify(stats)}`
}

export const getSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query
    const { start, end } = getDateRange(from, to)

    const match = {
      activityDate: { $gte: start, $lte: end },
    }

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

    const regionStats = await Submission.aggregate([
      { $match: match },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const activityStats = await Submission.aggregate([
      { $match: match },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const issuesAgg = await Submission.aggregate([
      { $match: { ...match, issues: { $ne: '' } } },
      { $group: { _id: '$issues', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])

    const topRegion = regionStats[0]?._id || 'N/A'
    const topActivity = activityStats[0]?._id || 'N/A'
    const topIssue = issuesAgg[0]?._id || 'No major issues reported'

    const baseSummaryText = `From ${start.toDateString()} to ${end.toDateString()}, ${totalSubmissions} activities were recorded with ${totalBeneficiaries} beneficiaries (${uniqueBeneficiaries} unique). Top activity: ${topActivity}. Top region: ${topRegion}. Major issue: ${topIssue}. Funds disbursed: ${totalFunds}.`
    const statsPayload = {
      range: { from: start.toISOString(), to: end.toISOString() },
      totalSubmissions,
      totalBeneficiaries,
      uniqueBeneficiaries,
      topRegion,
      topActivity,
      topIssue,
      totalFunds,
      regionStats: regionStats.slice(0, 5),
      activityStats: activityStats.slice(0, 5),
    }
    const aiSummary = await generateAiText(buildSummaryPrompt(statsPayload))
    const summaryText = aiSummary || baseSummaryText

    res.json({
      summaryText,
      data: {
        range: { from: start, to: end },
        totalSubmissions,
        totalBeneficiaries,
        uniqueBeneficiaries,
        totalFunds,
        topRegion,
        topActivity,
        topIssue,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getInsights = async (req, res, next) => {
  try {
    const { from, to } = req.query
    const { start, end } = getDateRange(from, to)

    const match = {
      activityDate: { $gte: start, $lte: end },
    }

    const regionStats = await Submission.aggregate([
      { $match: match },
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    let insights = []

    if (regionStats.length === 0) {
      insights.push('No submissions for the selected period. Encourage field teams to report.')
    } else {
      const topRegion = regionStats[0]
      const lowRegion = regionStats[regionStats.length - 1]

      insights.push(
        `Region ${topRegion._id} is leading with ${topRegion.count} activities recorded.`
      )

      if (lowRegion && lowRegion._id !== topRegion._id) {
        insights.push(
          `Region ${lowRegion._id} has low engagement with only ${lowRegion.count} activities.`
        )
      }
    }

    const statsPayload = {
      range: { from: start.toISOString(), to: end.toISOString() },
      regionStats: regionStats.slice(0, 8),
    }
    const aiInsightsText = await generateAiText(buildInsightsPrompt(statsPayload))
    const aiInsights = extractJsonArray(aiInsightsText)
    if (aiInsights && aiInsights.length > 0) {
      insights = aiInsights
    }

    res.json({
      range: { from: start, to: end },
      insights,
    })
  } catch (error) {
    next(error)
  }
}
