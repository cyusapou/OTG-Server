import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  routeId:       { type: String, required: true, index: true },
  companyId:     { type: String, required: true, index: true },
  depotId:       { type: String, default: null },
  busId:         { type: String, default: null },
  busPlate:      String,
  driverId:      { type: String, default: null },
  driverName:    String,
  driverContact: String,
  workerId:      { type: String, default: null },
  workerName:    String,
  departureTime: String,
  arrivalTime:   String,
  date:          String,
  days:          [String],
  totalSeats:    { type: Number, default: 45 },
  availableSeats:Number,
  priceRWF:      Number,
  status:        { type: String, default: 'scheduled' },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Schedule', schema)
