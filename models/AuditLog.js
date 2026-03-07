import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:      String,
  userRole:    String,
  companyId:   { type: String, index: true },
  action:      { type: String, required: true, index: true },
  targetType:  String,
  targetId:    String,
  description: String,
  metadata:    mongoose.Schema.Types.Mixed,
  ipAddress:   String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('AuditLog', schema)
