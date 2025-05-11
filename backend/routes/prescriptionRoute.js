const express = require('express');
const router = express.Router();
const {
    createPrescription,
    updatePrescription,
    getPrescriptionById,
    getAllPrescriptions,
    getActivePrescriptionsByPatientId,
    getActivePrescriptionsByDoctorId,
    getPrescriptionsByAppointmentId
} = require('../controllers/prescriptionController');
const { protect } = require('../middlewares/authMiddleware');
const { doctorOnly } = require('../middlewares/roleMiddleware');

// Route to create a new prescription
router.post('/', protect, doctorOnly, createPrescription);

// Route to update an existing prescription
router.put('/:id', protect, doctorOnly, updatePrescription);

// Route to get a specific prescription by ID
router.get('/:id', protect, getPrescriptionById);

// Route to get active prescriptions of a specific patient
router.get('/patient/:id', protect, getActivePrescriptionsByPatientId);

// Route to get active prescriptions of a specific doctor
router.get('/doctor/:id', protect, doctorOnly, getActivePrescriptionsByDoctorId);

// Route to get all prescriptions
router.get('/', protect, getAllPrescriptions);

// Route to get prescriptions by appointment ID
router.get('/appointment/:appointmentId', protect, getPrescriptionsByAppointmentId);

module.exports = router;