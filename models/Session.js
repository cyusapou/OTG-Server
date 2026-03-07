import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  role:      String,
  companyId: { type: String, default: null },
  depotId:   { type: String, default: null },
  expiresAt: Date,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Session', schema)
