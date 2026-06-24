const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    role: { type: String, required: [true, 'Role is required'], trim: true }, // e.g. Mason, Carpenter, Electrician
    dailyWage: { type: Number, required: [true, 'Daily wage is required'], min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workerSchema.index({ project: 1 });

module.exports = mongoose.model('Worker', workerSchema);
