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

  const modelName = process.env.GOOGLE_MODEL || 'gemini-3-flash-preview'
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
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
  return `You are an NGO reporting analyst. Write a highly detailed, comprehensive, multi-paragraph report for leadership. DO NOT write a short summary.
Structure your report with clear markdown headers (##) and bullet points.
Include the following detailed sections:
- ## Executive Summary
- ## Key Metrics Breakdown (Totals, Unique Reach, Funds)
- ## Regional Performance Analysis
- ## Top Activities and Impact
- ## Major Issues and Recommendations
Provide thorough analysis for each section based on this data:
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
    const baseSummaryText = `## Executive Summary
From **${start.toDateString()}** to **${end.toDateString()}**, the field team successfully recorded **${totalSubmissions}** activities across all operations. These initiatives reached a total of **${totalBeneficiaries}** beneficiaries, of which **${uniqueBeneficiaries}** were unique individuals.

## Key Metrics Breakdown
- **Total Activities Logged:** ${totalSubmissions}
- **Total Beneficiaries Reached:** ${totalBeneficiaries}
- **Unique Beneficiaries:** ${uniqueBeneficiaries}
- **Total Funds Disbursed:** ₹${totalFunds}

## Regional Performance Analysis
The most active region during this period was **${topRegion}**. Field workers in this area conducted the highest volume of outreach and community engagement compared to other sectors.

## Top Activities and Impact
The primary activity driving these numbers was **${topActivity}**. This indicates a strong focus on this particular type of intervention during this reporting cycle, resulting in significant community participation.

## Major Issues and Operational Bottlenecks
The most frequently reported issue from the field was **"${topIssue}"**. Leadership should review logistical and operational protocols to mitigate this challenge in future deployments.`
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
