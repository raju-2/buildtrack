const express = require('express');
const router = express.Router();
const { getOverview, getAllUsers, getAllProjects } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/users', getAllUsers);
router.get('/projects', getAllProjects);

module.exports = router;
