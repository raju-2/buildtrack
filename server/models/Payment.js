const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    date: { type: Date, required: true, default: Date.now },
    daysWorked: { type: Number, min: 0, default: 0 },
    note: { type: String, trim: true },
    mode: { type: String, enum: ['cash', 'bank', 'upi', 'other'], default: 'cash' },
  },
  { timestamps: true }
);

paymentSchema.index({ worker: 1, date: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
