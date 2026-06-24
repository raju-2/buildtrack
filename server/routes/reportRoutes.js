const express = require('express');
const router = express.Router();
const { getAnalytics, downloadPdfReport, downloadExcelReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/pdf', downloadPdfReport);
router.get('/excel', downloadExcelReport);

module.exports = router;
