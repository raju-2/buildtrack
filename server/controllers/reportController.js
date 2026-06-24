const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const Worker = require('../models/Worker');
const Project = require('../models/Project');
const { ownerOrSharedFilter } = require('./projectController');
const { predictNextMonthSpending } = require('../utils/predictSpending');

const getAccessibleProject = async (projectId, userId) =>
  Project.findOne({ _id: projectId, ...ownerOrSharedFilter(userId) });

/**
 * @desc Monthly + category-wise analytics for a project, plus a next-month spend prediction
 * @route GET /api/reports/analytics?project=<id>
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { project } = req.query;
    const projectDoc = await getAccessibleProject(project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    const monthlyAgg = await Expense.aggregate([
      { $match: { project: projectDoc._id } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthlyExpenses = monthlyAgg.map((m) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      total: m.total,
    }));

    const categoryAgg = await Expense.aggregate([
      { $match: { project: projectDoc._id } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const workers = await Worker.find({ project: projectDoc._id });
    const workerPayments = await Payment.aggregate([
      { $match: { project: projectDoc._id } },
      { $group: { _id: '$worker', totalPaid: { $sum: '$amount' } } },
    ]);
    const paymentMap = new Map(workerPayments.map((p) => [p._id.toString(), p.totalPaid]));
    const workerReport = workers.map((w) => ({
      name: w.name,
      role: w.role,
      dailyWage: w.dailyWage,
      totalPaid: paymentMap.get(w._id.toString()) || 0,
    }));

    res.json({
      success: true,
      data: {
        monthlyExpenses,
        categoryWiseSpending: categoryAgg.map((c) => ({ category: c._id, total: c.total })),
        workerReport,
        predictedNextMonthSpending: predictNextMonthSpending(monthlyExpenses),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Download a PDF summary report for a project
 * @route GET /api/reports/pdf?project=<id>
 */
const downloadPdfReport = async (req, res, next) => {
  try {
    const { project } = req.query;
    const projectDoc = await getAccessibleProject(project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    const expenses = await Expense.find({ project: projectDoc._id }).sort({ date: -1 });
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${projectDoc.name}-report.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text('BuildTrack Expense Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Project: ${projectDoc.name}`);
    doc.text(`Address: ${projectDoc.address}`);
    doc.text(`Total Budget: ₹${projectDoc.totalBudget.toLocaleString()}`);
    doc.text(`Total Spent: ₹${totalSpent.toLocaleString()}`);
    doc.text(`Remaining Budget: ₹${(projectDoc.totalBudget - totalSpent).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Expenses', { underline: true });
    doc.moveDown(0.5);

    expenses.forEach((e) => {
      doc
        .fontSize(10)
        .text(
          `${new Date(e.date).toLocaleDateString()}  |  ${e.category}  |  ${e.title}  |  ₹${e.amount.toLocaleString()}`
        );
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Export project expenses to an Excel (.xlsx) file
 * @route GET /api/reports/excel?project=<id>
 */
const downloadExcelReport = async (req, res, next) => {
  try {
    const { project } = req.query;
    const projectDoc = await getAccessibleProject(project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    const expenses = await Expense.find({ project: projectDoc._id }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expenses');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
    ];

    expenses.forEach((e) => {
      sheet.addRow({
        date: new Date(e.date).toLocaleDateString(),
        title: e.title,
        category: e.category,
        amount: e.amount,
        description: e.description || '',
      });
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${projectDoc.name}-expenses.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics, downloadPdfReport, downloadExcelReport };
