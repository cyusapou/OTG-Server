import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:        { type: String, required: true, index: true },
  date:          String,
  time:          String,
  originId:      String,
  destinationId: String,
  tripType:      { type: String, default: 'one_time' },
  remindMe:      { type: Boolean, default: false },
  status:        { type: String, default: 'upcoming' },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('PlannedTrip', schema)
