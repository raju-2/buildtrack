const Project = require('../models/Project');
const Expense = require('../models/Expense');
const Worker = require('../models/Worker');
const { ownerOrSharedFilter } = require('./projectController');

/**
 * @desc Get dashboard summary stats for a project (or all projects if none specified)
 * @route GET /api/dashboard?project=<id>
 */
const getDashboard = async (req, res, next) => {
  try {
    const { project } = req.query;

    let projectFilter = { project: { $exists: true } };
    let budgetTotal = 0;

    if (project) {
      const projectDoc = await Project.findOne({ _id: project, ...ownerOrSharedFilter(req.user._id) });
      if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });
      projectFilter = { project: projectDoc._id };
      budgetTotal = projectDoc.totalBudget;
    } else {
      const projects = await Project.find(ownerOrSharedFilter(req.user._id));
      const projectIds = projects.map((p) => p._id);
      projectFilter = { project: { $in: projectIds } };
      budgetTotal = projects.reduce((sum, p) => sum + p.totalBudget, 0);
    }

    const [spentAgg, expenseCount, workerCount, recentTransactions, categoryAgg, monthlyAgg] = await Promise.all([
      Expense.aggregate([{ $match: projectFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.countDocuments(projectFilter),
      Worker.countDocuments(projectFilter),
      Expense.find(projectFilter).sort({ date: -1 }).limit(10),
      Expense.aggregate([
        { $match: projectFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: projectFilter },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalSpent = spentAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalBudget: budgetTotal,
        totalSpent,
        remainingBudget: budgetTotal - totalSpent,
        budgetUsedPercent: budgetTotal ? Number(((totalSpent / budgetTotal) * 100).toFixed(1)) : 0,
        workerCount,
        expenseCount,
        recentTransactions,
        categoryWiseSpending: categoryAgg.map((c) => ({ category: c._id, total: c.total })),
        monthlyExpenses: monthlyAgg.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          total: m.total,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
