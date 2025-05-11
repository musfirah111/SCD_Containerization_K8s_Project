const express = require('express');
const {
    //getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDailySchedule,
    getWeeklySchedule,
    getAllDoctors,
    getDoctorCountByDepartment,
    getDoctorSchedule,
    getDoctorDetailsByUserId,
    calculateRevenue,
    updateDoctorExperience,
    updateConsultationFee
} = require('../controllers/doctorController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly, doctorOnly } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Route to get all doctors - accessible to all authenticated users.
//router.get('/', protect, getDoctors);

router.get('/revenue', calculateRevenue);

router.get('/:doctorId/schedule/:date', protect, getDoctorSchedule);

// Route to get the count of doctors in each department
router.get('/count', protect, getDoctorCountByDepartment);

router.get('/', protect, getAllDoctors);

// Route to get a doctor by ID - accessible to all authenticated users.
router.get('/:id', protect, getDoctorById);


// Route to create a new doctor - admin only.
router.post('/', protect, adminOnly, createDoctor);

// Route to update a doctor by ID - dcotors only.
router.put('/:id', protect, doctorOnly, updateDoctor);

// Route to delete a doctor by ID - admin only.
router.delete('/:id', protect, adminOnly, deleteDoctor);

// Schedule routes
router.get('/schedule/daily', protect, doctorOnly, getDailySchedule);
router.get('/schedule/weekly', protect, doctorOnly, getWeeklySchedule);


//get doctor details by user id
router.get('/user/:id', protect, getDoctorDetailsByUserId);

// Add this route with your other doctor routes
router.put('/:id/consultation-fee', updateConsultationFee);

// Update doctor's experience
router.patch('/:id/experience', updateDoctorExperience);

module.exports = router;