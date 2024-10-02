import mongoose from 'mongoose'

const Schema = mongoose.Schema

const replenishmentSchema = new Schema(
  {
    percent: { type: Number, default: 80, },
    amount: { type: Number, default: 0, },
    income: { type: Number, default: 0, },
    service: { type: String, default: '', },
    worker: { type: String, default: '', },
    state: { type: String, default: '', },
  },
  { versionKey: false, timestamps: true }
)

export const Replenishment = mongoose.model('replenishments', replenishmentSchema)
