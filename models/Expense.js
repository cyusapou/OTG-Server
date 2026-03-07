import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  companyId:   { type: String, required: true, index: true },
  depotId:     { type: String, index: true },
  category:    { type: String, enum: ['fuel', 'maintenance', 'salary', 'insurance', 'parking', 'cleaning', 'office', 'other'] },
  description: String,
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'RWF' },
  busId:       String,
  date:        String,
  loggedBy:    String,
  receiptUrl:  String,
  createdBy:   String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Expense', schema)
