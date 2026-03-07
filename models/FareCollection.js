import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  bookingId:     String,
  scheduleId:    String,
  routeId:       String,
  companyId:     { type: String, required: true, index: true },
  depotId:       { type: String, index: true },
  driverId:      String,
  workerId:      String,
  amount:        { type: Number, required: true },
  currency:      { type: String, default: 'RWF' },
  paymentMethod: String,
  collectedAt:   Date,
  tripDate:      { type: String, index: true },
  routeName:     String,
  route:         String,
  passengerCount:Number,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('FareCollection', schema)
