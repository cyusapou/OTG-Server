import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  userId:   { type: String, required: true, index: true },
  title:    String,
  body:     String,
  message:  String,
  type:     { type: String, default: 'info' },
  priority: { type: String, default: 'normal' },
  isRead:   { type: Boolean, default: false },
  link:     String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Notification', schema)
