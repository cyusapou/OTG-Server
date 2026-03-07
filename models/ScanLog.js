import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  workerId:   { type: String, required: true, index: true },
  bookingId:  { type: String, required: true },
  scheduleId: { type: String, index: true },
  scannedAt:  { type: Date, default: Date.now },
  result:     { type: String, enum: ['valid', 'invalid', 'expired', 'already_scanned', 'wrong_trip'] },
  reason:     String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('ScanLog', schema)
