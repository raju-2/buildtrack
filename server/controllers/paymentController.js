const Payment = require('../models/Payment');
const Worker = require('../models/Worker');
const { assertProjectAccess } = require('./expenseController');

/**
 * @desc Get payments, optionally filtered by worker or project
 * @route GET /api/payments?worker=<id>&project=<id>
 */
const getPayments = async (req, res, next) => {
  try {
    const { worker, project } = req.query;
    const filter = {};

    if (worker) filter.worker = worker;
    if (project) {
      const hasAccess = await assertProjectAccess(project, req.user._id);
      if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });
      filter.project = project;
    } else if (worker) {
      const workerDoc = await Worker.findById(worker);
      if (!workerDoc) return res.status(404).json({ success: false, message: 'Worker not found' });
      const hasAccess = await assertProjectAccess(workerDoc.project, req.user._id);
      if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });
    } else {
      return res.status(400).json({ success: false, message: 'Provide worker or project query param' });
    }

    const payments = await Payment.find(filter).sort({ date: -1 }).populate('worker', 'name role');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Record a new payment made to a worker
 * @route POST /api/payments
 */
const createPayment = async (req, res, next) => {
  try {
    const { worker, amount, date, daysWorked, note, mode } = req.body;
    if (!worker || amount === undefined) {
      return res.status(400).json({ success: false, message: 'worker and amount are required' });
    }

    const workerDoc = await Worker.findById(worker);
    if (!workerDoc) return res.status(404).json({ success: false, message: 'Worker not found' });

    const hasAccess = await assertProjectAccess(workerDoc.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const payment = await Payment.create({
      worker,
      project: workerDoc.project,
      user: req.user._id,
      amount,
      date: date || Date.now(),
      daysWorked,
      note,
      mode,
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete a payment record
 * @route DELETE /api/payments/:id
 */
const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const hasAccess = await assertProjectAccess(payment.project, req.user._id);
    if (!hasAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    await payment.deleteOne();
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, createPayment, deletePayment };
