const Project = require('../models/Project');
const Expense = require('../models/Expense');
const Worker = require('../models/Worker');
const User = require('../models/User');

/**
 * Builds a filter that matches projects the user owns OR has been shared with.
 */
const ownerOrSharedFilter = (userId) => ({
  $or: [{ owner: userId }, { 'sharedWith.user': userId }],
});

/**
 * @desc Get all projects for the logged-in user (owned + shared)
 * @route GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find(ownerOrSharedFilter(req.user._id))
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get a single project by id (must own or have shared access)
 * @route GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      ...ownerOrSharedFilter(req.user._id),
    }).populate('owner', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new project
 * @route POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, address, startDate, expectedCompletionDate, totalBudget } = req.body;

    if (!name || !address || !startDate || totalBudget === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, address, startDate and totalBudget are required',
      });
    }

    const project = await Project.create({
      owner: req.user._id,
      name,
      address,
      startDate,
      expectedCompletionDate,
      totalBudget,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a project (owner only)
 * @route PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or you do not have permission' });
    }

    const fields = ['name', 'address', 'startDate', 'expectedCompletionDate', 'totalBudget', 'status'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a project and cascade-delete its expenses & workers
 * @route DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or you do not have permission' });
    }

    await Expense.deleteMany({ project: project._id });
    await Worker.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Share project access with a family member by email
 * @route POST /api/projects/:id/share
 */
const shareProject = async (req, res, next) => {
  try {
    const { email, permission } = req.body;
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or you do not have permission' });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'No registered user found with that email' });
    }

    const alreadyShared = project.sharedWith.find((s) => s.user.toString() === targetUser._id.toString());
    if (alreadyShared) {
      alreadyShared.permission = permission || 'view';
    } else {
      project.sharedWith.push({ user: targetUser._id, permission: permission || 'view' });
    }

    await project.save();
    res.json({ success: true, message: `Project shared with ${email}`, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  shareProject,
  ownerOrSharedFilter,
};
