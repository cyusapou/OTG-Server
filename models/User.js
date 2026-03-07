import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username:            { type: String, index: true },
  password:            String,
  role:                { type: String, enum: ['rura', 'express_admin', 'manager', 'driver', 'worker', 'passenger'], index: true },
  firstName:           String,
  lastName:            String,
  email:               { type: String, sparse: true },
  phone:               { type: String, sparse: true },
  companyId:           { type: String, default: null, index: true },
  depotId:             { type: String, default: null, index: true },
  mustChangePassword:  { type: Boolean, default: true },
  isActive:            { type: Boolean, default: true },
  status:              { type: String, default: 'active' },
  walletBalance:       { type: Number, default: 0 },
  preferredLanguage:   { type: String, default: 'en' },
  lastLoginAt:         Date,
  createdBy:           { type: String, default: null },
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('User', schema)
