import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  scheduleId:        { type: String, required: true, index: true },
  driverId:          String,
  date:              { type: String, index: true },
  status:            { type: String, enum: ['scheduled', 'boarding', 'in_progress', 'arrived', 'cancelled'], default: 'scheduled' },
  startedAt:         Date,
  arrivedAt:         Date,
  estimatedArrival:  Date,
  currentLocation:   mongoose.Schema.Types.Mixed,
  passengersBoarded: { type: Number, default: 0 },
  totalSeats:        { type: Number, default: 45 },
  notes:             String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('TripStatus', schema)
