const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getWorkers).post(createWorker);
router.route('/:id').get(getWorkerById).put(updateWorker).delete(deleteWorker);

module.exports = router;
