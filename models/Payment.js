import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:        { type: String, index: true },
  bookingId:     { type: String, index: true },
  amount:        Number,
  currency:      { type: String, default: 'RWF' },
  method:        String,
  provider:      String,
  phone:         String,
  status:        { type: String, default: 'pending' },
  transactionId: String,
  paidAt:        Date,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Payment', schema)
