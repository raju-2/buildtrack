const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { scanBill } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/').get(getExpenses).post(upload.single('billImage'), createExpense);
router.post('/ocr', upload.single('bill'), scanBill);
router
  .route('/:id')
  .get(getExpenseById)
  .put(upload.single('billImage'), updateExpense)
  .delete(deleteExpense);

module.exports = router;
