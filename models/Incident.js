import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  tripStatusId: String,
  scheduleId:   String,
  companyId:    { type: String, required: true, index: true },
  depotId:      { type: String, index: true },
  reportedBy:   String,
  reporterRole: String,
  type:         { type: String, enum: ['breakdown', 'accident', 'delay', 'passenger_complaint', 'road_block', 'weather', 'fuel_shortage', 'other'] },
  description:  String,
  severity:     { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  status:       { type: String, enum: ['open', 'under_review', 'resolved'], default: 'open', index: true },
  resolvedBy:   String,
  resolvedAt:   Date,
  resolution:   String,
  date:         String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Incident', schema)
