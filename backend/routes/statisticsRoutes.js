const express = require('express');
const router = express.Router();
const {
    getDoctorRating,
    getTopRatedDoctorsByDepartment,
    getDoctorStats
} = require('../controllers/statisticsController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.get('/ratings/doctor/:doctor_id', protect, adminOnly, getDoctorRating);
router.get('/ratings/departments/top-doctors', protect, getTopRatedDoctorsByDepartment);
router.get('/doctor/:doctor_id/stats', protect, getDoctorStats);

module.exports = router;