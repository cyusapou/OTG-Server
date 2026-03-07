import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  driverId:  { type: String, required: true, index: true },
  userId:    String,
  companyId: String,
  depotId:   String,
  expiresAt: Date,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('DriverSession', schema)
