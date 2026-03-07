import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name:       { type: String, required: true },
  code:       String,
  city:       String,
  latitude:   Number,
  longitude:  Number,
  isTerminal: { type: Boolean, default: false },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Stop', schema)
