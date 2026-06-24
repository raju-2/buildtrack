const Expense = require('../models/Expense');
const Project = require('../models/Project');
const { ownerOrSharedFilter } = require('./projectController');
const { checkBudgetThresholds } = require('../utils/notificationHelper');

/**
 * Verifies the requesting user can access (owner or shared) the given project.
 */
const assertProjectAccess = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, ...ownerOrSharedFilter(userId) });
  return project;
};

/**
 * @desc Get expenses for a project, with optional filters: category, date range, search
 * @route GET /api/expenses?project=<id>&category=&from=&to=&search=&page=&limit=
 */
const getExpenses = async (req, res, next) => {
  try {
    const { project, category, from, to, search, page = 1, limit = 20 } = req.query;

    if (!project) {
      return res.status(400).json({ success: false, message: 'project query param is required' });
    }

    const hasAccess = await assertProjectAccess(project, req.user._id);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'You do not have access to this project' });
    }

    const filter = { project };
    if (category) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: expenses.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single expense
 * @route GET /api/expenses/:id
 */
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const hasAccess = await assertProjectAccess(expense.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create an expense, with optional bill image upload
 * @route POST /api/expenses
 */
const createExpense = async (req, res, next) => {
  try {
    const { project, title, amount, category, date, description } = req.body;

    if (!project || !title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'project, title, amount and category are required',
      });
    }

    const projectDoc = await assertProjectAccess(project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    const expense = await Expense.create({
      project,
      user: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
      billImage: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    // Check budget thresholds and notify if needed
    const agg = await Expense.aggregate([
      { $match: { project: projectDoc._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalSpent = agg[0]?.total || 0;
    await checkBudgetThresholds(projectDoc, totalSpent);

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an expense
 * @route PUT /api/expenses/:id
 */
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const projectDoc = await assertProjectAccess(expense.project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    const fields = ['title', 'amount', 'category', 'date', 'description'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) expense[field] = req.body[field];
    });
    if (req.file) expense.billImage = `/uploads/${req.file.filename}`;

    await expense.save();

    const agg = await Expense.aggregate([
      { $match: { project: projectDoc._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    await checkBudgetThresholds(projectDoc, agg[0]?.total || 0);

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete an expense
 * @route DELETE /api/expenses/:id
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const projectDoc = await assertProjectAccess(expense.project, req.user._id);
    if (!projectDoc) return res.status(403).json({ success: false, message: 'Access denied' });

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense, assertProjectAccess };
