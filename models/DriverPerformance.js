import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  driverId:               { type: String, required: true, index: true },
  companyId:              { type: String, required: true, index: true },
  month:                  { type: String, required: true },
  tripsCompleted:         { type: Number, default: 0 },
  tripsAssigned:          { type: Number, default: 0 },
  onTimeRate:             { type: Number, default: 0 },
  totalPassengersCarried: { type: Number, default: 0 },
  incidentsReported:      { type: Number, default: 0 },
  complaintsReceived:     { type: Number, default: 0 },
  totalKmDriven:          { type: Number, default: 0 },
  rating:                 { type: Number, default: 0 },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('DriverPerformance', schema)
