const express = require('express');
const router = express.Router();

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    updateAppointment,
    requestAppointment,
    getDailyAppointments,
    getWeeklyAppointments,
    getMonthlyAppointments,
    getCompletedAppointments,
    getRequestedAppointments,
    requestCancellation,
    getPatientAppointments,
    getAvailableSlotsForDoctor,
    getDoctorAppointments  
} = require('../controllers/appointmentController');

const { protect } = require('../middlewares/authMiddleware');
const { adminOnly, doctorOnly } = require('../middlewares/roleMiddleware');

const { getNotifications } = require('../controllers/notificationController');

// Route to get notifications for a specific user
router.get('/notifications/:id', protect, getNotifications);

// Route to get available slots for a doctor
router.get('/available-slots/:doctorId', protect, getAvailableSlotsForDoctor);

// Get patient appointments
router.get('/patient/:id', protect, getPatientAppointments);

// Route to get available slots for a doctor
router.get('/available-slots/:doctorId', protect, getAvailableSlotsForDoctor);

router.get('/daily-registrations', protect, getDailyAppointments);
router.get('/weekly-registrations', protect, getWeeklyAppointments);
router.get('/monthly-registrations', protect, getMonthlyAppointments);
// Route for getting completed appointments with pagination
router.get('/completed', getCompletedAppointments);

// Route for getting requested or rescheduled appointments with pagination
router.get('/requested', getRequestedAppointments);

// Route to get all appointments (admin only).
router.get('/', protect, getAppointments);

// Route to get appointment by ID (protected).
router.get('/:id', protect, getAppointmentById);

// Route to update appointment status (doctor only).
router.put('/:id/status', protect, updateAppointmentStatus);

// Route to update/reschedule appointment (admin only)
router.put('/:id', protect, adminOnly, updateAppointment);

// Route to request an appointment
router.post('/request', protect, requestAppointment);

// Route to request appointment cancellation
router.post('/cancel', protect, requestCancellation);

// Route to create a new appointment (admin only).
router.post('/', protect, adminOnly, createAppointment);

// Route to get doctor appointments
router.get('/doctor/:id', protect, doctorOnly, getDoctorAppointments);

module.exports = router;
