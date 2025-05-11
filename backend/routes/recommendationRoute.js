const express = require('express');
const router = express.Router();
const { getDoctorRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middlewares/authMiddleware');

// Route to get doctor recommendations based on patient ID from the request body
router.post('/', protect, getDoctorRecommendations);

module.exports = router;
