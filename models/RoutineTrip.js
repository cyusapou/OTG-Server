import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:             { type: String, required: true, index: true },
  name:               String,
  label:              String,
  icon:               String,
  iconColor:          String,
  originStop:         mongoose.Schema.Types.Mixed,
  destinationStop:    mongoose.Schema.Types.Mixed,
  originId:           String,
  destinationId:      String,
  usualDepartureTime: String,
  departureTime:      String,
  daysOfWeek:         [Number],
  days:               [String],
  companyId:          String,
  remindMe:           { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('RoutineTrip', schema)
