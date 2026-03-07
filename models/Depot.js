import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name:      { type: String, required: true },
  city:      String,
  address:   String,
  phone:     String,
  companyId: { type: String, required: true, index: true },
  managerId: { type: String, default: null },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Depot', schema)
