import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  routeId:         { type: String, required: true },
  companyId:       { type: String, required: true, index: true },
  submittedBy:     String,
  submittedAt:     Date,
  status:          { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  justification:   String,
  origin:          String,
  destination:     String,
  reviewedAt:      Date,
  reviewedBy:      String,
  rejectionReason: String,
  approvedAt:      Date,
  expiresAt:       Date,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('RouteApproval', schema)
