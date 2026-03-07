import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  origin:         String,
  originId:       String,
  originCode:     String,
  destination:    String,
  destinationId:  String,
  destinationCode:String,
  stops:          [String],
  distance:       Number,
  distanceKm:     Number,
  duration:       Number,
  durationMinutes:Number,
  fare:           Number,
  priceRWF:       Number,
  days:           [String],
  departureTimes: [String],
  companyId:      { type: String, required: true, index: true },
  isActive:       { type: Boolean, default: false },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Route', schema)
