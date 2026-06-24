const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Project name is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    startDate: { type: Date, required: true },
    expectedCompletionDate: { type: Date },
    totalBudget: { type: Number, required: [true, 'Total budget is required'], min: 0 },
    status: { type: String, enum: ['ongoing', 'completed', 'on-hold'], default: 'ongoing' },

    // Shared access - family members invited via email
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: { type: String, enum: ['view', 'edit'], default: 'view' },
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });

module.exports = mongoose.model('Project', projectSchema);
