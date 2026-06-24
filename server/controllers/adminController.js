const User = require('../models/User');
const Project = require('../models/Project');
const Expense = require('../models/Expense');

/**
 * @desc Get platform-wide stats for the admin panel
 * @route GET /api/admin/overview
 */
const getOverview = async (req, res, next) => {
  try {
    const [userCount, projectCount, expenseCount, spendAgg] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        userCount,
        projectCount,
        expenseCount,
        totalSpendAcrossPlatform: spendAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List all users (admin only)
 * @route GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-otp -otpExpiry -resetPasswordToken -resetPasswordExpiry');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc List all projects across all users (admin only)
 * @route GET /api/admin/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('owner', 'name email');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getAllUsers, getAllProjects };
