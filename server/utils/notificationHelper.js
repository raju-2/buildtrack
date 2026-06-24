const Notification = require('../models/Notification');

/**
 * Creates a notification for a user, avoiding duplicate spam by checking
 * if an identical unread notification already exists for the project+type.
 */
const createNotification = async ({ user, project, type, message }) => {
  const existing = await Notification.findOne({ user, project, type, isRead: false });
  if (existing) return existing;
  return Notification.create({ user, project, type, message });
};

/**
 * Checks a project's spend against its budget and creates warning/exceeded
 * notifications at the 80% and 100% thresholds.
 */
const checkBudgetThresholds = async (project, totalSpent) => {
  const percentUsed = (totalSpent / project.totalBudget) * 100;

  if (percentUsed >= 100) {
    await createNotification({
      user: project.owner,
      project: project._id,
      type: 'budget-exceeded',
      message: `Project "${project.name}" has exceeded its total budget of ₹${project.totalBudget.toLocaleString()}.`,
    });
  } else if (percentUsed >= 80) {
    await createNotification({
      user: project.owner,
      project: project._id,
      type: 'budget-warning',
      message: `Project "${project.name}" has used ${percentUsed.toFixed(1)}% of its budget.`,
    });
  }
};

module.exports = { createNotification, checkBudgetThresholds };
