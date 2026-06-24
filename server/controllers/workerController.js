const Worker = require('../models/Worker');
const Payment = require('../models/Payment');
const { assertProjectAccess } = require('./expenseController');

/**
 * @desc Get all workers for a project, with outstanding balance calculated
 * @route GET /api/workers?project=<id>
 */
const getWorkers = async (req, res, next) => {
  try {
    const { project } = req.query;
    if (!project) return res.status(400).json({ success: false, message: 'project query param is required' });

    const hasAccess = await assertProjectAccess(project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const workers = await Worker.find({ project }).sort({ createdAt: -1 });

    // Attach total paid + outstanding balance for each worker.
    // Outstanding balance here is a simple running total of payments made
    // (kept as a manual ledger since "days worked" is tracked per-payment).
    const workerIds = workers.map((w) => w._id);
    const payments = await Payment.aggregate([
      { $match: { worker: { $in: workerIds } } },
      { $group: { _id: '$worker', totalPaid: { $sum: '$amount' }, paymentsCount: { $sum: 1 } } },
    ]);
    const paymentMap = new Map(payments.map((p) => [p._id.toString(), p]));

    const result = workers.map((w) => {
      const stats = paymentMap.get(w._id.toString());
      return {
        ...w.toObject(),
        totalPaid: stats?.totalPaid || 0,
        paymentsCount: stats?.paymentsCount || 0,
      };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single worker with payment history
 * @route GET /api/workers/:id
 */
const getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const hasAccess = await assertProjectAccess(worker.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const payments = await Payment.find({ worker: worker._id }).sort({ date: -1 });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, data: { ...worker.toObject(), payments, totalPaid } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a worker
 * @route POST /api/workers
 */
const createWorker = async (req, res, next) => {
  try {
    const { project, name, phone, role, dailyWage } = req.body;
    if (!project || !name || !phone || !role || dailyWage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'project, name, phone, role and dailyWage are required',
      });
    }

    const hasAccess = await assertProjectAccess(project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const worker = await Worker.create({ project, user: req.user._id, name, phone, role, dailyWage });
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update a worker
 * @route PUT /api/workers/:id
 */
const updateWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const hasAccess = await assertProjectAccess(worker.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const fields = ['name', 'phone', 'role', 'dailyWage', 'isActive'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) worker[field] = req.body[field];
    });

    await worker.save();
    res.json({ success: true, data: worker });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a worker (and their payment history)
 * @route DELETE /api/workers/:id
 */
const deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const hasAccess = await assertProjectAccess(worker.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    await Payment.deleteMany({ worker: worker._id });
    await worker.deleteOne();

    res.json({ success: true, message: 'Worker and payment history deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker };
