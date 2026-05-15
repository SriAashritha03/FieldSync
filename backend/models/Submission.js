import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    region: { type: String, required: true, trim: true },
    activityType: { type: String, required: true, trim: true },
    beneficiaryCount: { type: Number, required: true, min: 0 },
    issues: { type: String, default: '' },
    notes: { type: String, default: '' },
    activityDate: { type: Date, required: true },
    beneficiary: {
      identifier: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
      age: { type: Number, min: 0 },
      dateOfBirth: { type: Date },
      gender: { type: String, default: '' },
      socioeconomicStatus: { type: String, default: '' },
      phonePrimary: { type: String, default: '' },
      phoneSecondary: { type: String, default: '' },
      address: { type: String, default: '' },
      village: { type: String, default: '' },
      vulnerabilityStatus: [{ type: String }],
      consentGiven: { type: Boolean, required: true },
    },
    project: {
      code: { type: String, required: true, trim: true },
      name: { type: String, default: '' },
    },
    metrics: {
      itemsDistributed: { type: Number, min: 0, default: 0 },
      trainingHours: { type: Number, min: 0, default: 0 },
      fundsDisbursed: { type: Number, min: 0, default: 0 },
      targetBeneficiaries: { type: Number, min: 0, default: 0 },
    },
    feedback: {
      qualitative: { type: String, default: '' },
      satisfaction: { type: String, default: '' },
    },
    staff: {
      staffId: { type: String, default: '' },
      staffName: { type: String, default: '' },
    },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      capturedAt: { type: Date },
    },
    offlineStatus: {
      isOffline: { type: Boolean, default: false },
      syncedAt: { type: Date },
    },
    media: [
      {
        filename: { type: String },
        path: { type: String },
        mimetype: { type: String },
        size: { type: Number },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
)

submissionSchema.index({ region: 1, activityType: 1, activityDate: -1 })
submissionSchema.index({ 'beneficiary.identifier': 1, activityDate: -1 })
submissionSchema.index({ 'project.code': 1, activityDate: -1 })
submissionSchema.index({ 'staff.staffName': 1, activityDate: -1 })
submissionSchema.index({
  region: 'text',
  activityType: 'text',
  issues: 'text',
  notes: 'text',
  'beneficiary.identifier': 'text',
  'beneficiary.name': 'text',
  'project.code': 'text',
  'project.name': 'text',
  'feedback.qualitative': 'text',
  'staff.staffName': 'text',
})

export default mongoose.model('Submission', submissionSchema)
