import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  companyId: { type: String, required: true, index: true },
  depotId:   { type: String, index: true },
  role:      String,
  name:      String,
  amount:    { type: Number, required: true },
  currency:  { type: String, default: 'RWF' },
  month:     { type: String, required: true },
  status:    { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt:    Date,
  paidBy:    String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Salary', schema)
