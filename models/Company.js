import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name:               { type: String, required: true },
  slug:               String,
  description:        String,
  registrationNumber: String,
  companyType:        String,
  headquarters:       String,
  address:            String,
  phone:              String,
  email:              String,
  website:            String,
  logo:               String,
  busImage:           String,
  licenseNumber:      String,
  licenseExpiry:      Date,
  rating:             { type: Number, default: 0 },
  totalTrips:         { type: Number, default: 0 },
  isActive:           { type: Boolean, default: true },
  status:             { type: String, default: 'active' },
  createdBy:          String,
}, { timestamps: true })

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret.__v; return ret }
})

export default mongoose.model('Company', schema)
