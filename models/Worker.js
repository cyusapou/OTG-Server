import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:              { type: String, required: true, index: true },
  name:                String,
  companyId:           { type: String, required: true, index: true },
  depotId:             { type: String, default: null },
  phone:               String,
  assignedBusId:       String,
  assignedScheduleIds: [String],
  pin:                 String,
  isActive:            { type: Boolean, default: true },
  status:              { type: String, default: 'active' },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Worker', schema)
