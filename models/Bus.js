import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  plateNumber:     String,
  plate:           String,
  make:            String,
  model:           String,
  year:            Number,
  capacity:        { type: Number, default: 45 },
  amenities:       [String],
  depotId:         { type: String, default: null },
  companyId:       { type: String, required: true, index: true },
  driverId:        { type: String, default: null },
  assignedDriverId:String,
  insuranceExpiry: String,
  lastServiceDate: String,
  nextServiceDate: String,
  isActive:        { type: Boolean, default: true },
  status:          { type: String, default: 'active' },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Bus', schema)
