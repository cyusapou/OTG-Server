import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:            { type: String, index: true },
  scheduleId:        { type: String, index: true },
  tripId:            String,
  routeId:           String,
  companyId:         String,
  busId:             String,
  date:              { type: String, index: true },
  seatNumber:        Number,
  seats:             [Number],
  passengerName:     String,
  passengerEmail:    String,
  passengerPhone:    String,
  passengerType:     { type: String, default: 'adult' },
  priceRWF:          Number,
  totalPrice:        Number,
  status:            { type: String, default: 'confirmed', index: true },
  paymentMethod:     String,
  paymentStatus:     { type: String, default: 'pending' },
  qrCode:            String,
  qrData:            mongoose.Schema.Types.Mixed,
  qrScanned:         { type: Boolean, default: false },
  scannedAt:         Date,
  scannedByWorkerId: String,
  bookedAt:          { type: Date, default: Date.now },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Booking', schema)
