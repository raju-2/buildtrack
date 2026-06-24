const mongoose = require('mongoose');

/**
 * The 9 default categories are hardcoded as an enum on the Expense model
 * for fast validation. This collection allows a user to see/manage the
 * default list and optionally add custom categories in the future.
 */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
