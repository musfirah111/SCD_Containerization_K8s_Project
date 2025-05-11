const express = require('express');
const router = express.Router();
const {
    createReport,
    getReportById,
    searchReportsByPatientId,
    searchReportsByName,
    downloadReport,
    shareReport,
    getDailyLabReports,
    getWeeklyLabReports,
    getMonthlyLabReports,
    getLabReportsByPatientId,
    getLabReportsByDoctorId
} = require('../controllers/medicalLabTestReportController');
const { protect } = require('../middlewares/authMiddleware');
const { doctorOnly } = require('../middlewares/roleMiddleware');

// Specific routes first
router.get('/patient/:patientId/reports', protect, getLabReportsByPatientId);
router.get('/patient/:patientId/search', protect, searchReportsByPatientId);
router.get('/daily-registrations', protect, getDailyLabReports);
router.get('/weekly-registrations', protect, getWeeklyLabReports);
router.get('/monthly-registrations', protect, getMonthlyLabReports);
router.get('/search', protect, searchReportsByName);
router.get('/download/:id', protect, downloadReport);
router.post('/share/:id', protect, shareReport);
router.get('/doctor/:id', protect, getLabReportsByDoctorId);

// Generic routes last
router.post('/', protect, doctorOnly, createReport);
router.get('/:id', protect, getReportById);
router.get('/doctor/:id', protect, getLabReportsByDoctorId);

module.exports = router; 