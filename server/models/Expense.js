const mongoose = require('mongoose');

const CATEGORIES = [
  'Cement',
  'Steel',
  'Bricks',
  'Sand',
  'Electrical',
  'Plumbing',
  'Interior',
  'Labor',
  'Miscellaneous',
];

const expenseSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, trim: true },
    billImage: { type: String }, // URL/path to uploaded bill image
    extractedAmount: { type: Number }, // OCR-extracted amount (advanced feature)
  },
  { timestamps: true }
);

expenseSchema.index({ project: 1, date: -1 });
expenseSchema.index({ project: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
