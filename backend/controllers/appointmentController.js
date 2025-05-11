const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const moment = require('moment');
const Invoice = require('../models/Billing');
const Notification = require('../models/Notification');
const User = require('../models/User');
const cron = require('node-cron');
const mongoose = require('mongoose');


// Function to get available time slots.
const getAvailableTimeSlots = async (doctorId, date) => {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.availability_status) {
        return [];
    }

    // Define possible time slots based on doctor's shift.
    const timeSlots = {
        'Morning': ['09:00', '10:00', '11:00', '12:00'],
        'Evening': ['14:00', '15:00', '16:00', '17:00'],
        'Night': ['18:00', '19:00', '20:00', '21:00']
    };

    // Get all appointments for the doctor on the given date.
    const existingAppointments = await Appointment.find({
        doctor_id: doctorId,
        appointment_date: {
            $gte: moment(date).startOf('day'),
            $lte: moment(date).endOf('day')
        },
        status: { $nin: ['Cancelled'] }
    });

    const bookedTimes = existingAppointments.map(apt => apt.appointment_time);
    const availableSlots = timeSlots[doctor.shift].filter(
        time => !bookedTimes.includes(time)
    );

    return availableSlots;
};

// Function to send reminders for upcoming appointments
const sendAppointmentReminders = async () => {
    console.log('Starting appointment reminders...');
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find all appointments scheduled for the next 24 hours
    const upcomingAppointments = await Appointment.find({
        appointment_date: {
            $gte: now,
            $lt: reminderTime
        },
        status: 'Scheduled'
    }).populate('patient_id'); // Populate patient details

    console.log(`Found ${upcomingAppointments.length} upcoming appointments.`);

    for (const appointment of upcomingAppointments) {
        // Check if the appointment is less than 24 hours away
        const appointmentDate = new Date(appointment.appointment_date);
        if (appointmentDate > now && appointmentDate <= reminderTime) {
            console.log(`Creating notification for appointment ID: ${appointment._id}`);
            try {
                if (appointment.patient_id) {
                    console.log('Appointment details:', appointment);
                    const notification = await Notification.create({
                        title: 'The Appointment Reminder',
                        user_id: appointment.patient_id.user_id, // Use user_id instead of patient_id's _id
                        message: `You have an appointment scheduled on ${moment(appointment.appointment_date).format('YYYY-MM-DD')}.`,
                    });
                    console.log(`Notification sent to user ${appointment.patient_id.user_id}: ${notification}`);
                } else {
                    console.error('Patient ID is not populated for appointment ID:', appointment._id);
                }
            } catch (error) {
                console.error('Error creating notification:', error);
            }
        }
    }
};

// Schedule the reminder function to run every hour
cron.schedule('* * * * *', sendAppointmentReminders); // Runs at the start of every hour

// Create appointment.
const createAppointment = asyncHandler(async (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

    // Fetch the doctor to check availability
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor || !doctor.availability_status) {
        res.status(400);
        throw new Error('Doctor is not available for appointments.');
    }

    // Check if the requested time slot is available.
    const availableSlots = await getAvailableTimeSlots(
        doctor_id,
        appointment_date
    );

    if (!availableSlots.includes(appointment_time)) {
        res.status(400);
        return res.json({
            message: 'Selected time slot is not available.',
            availableSlots: availableSlots,
            suggestedDate: moment(appointment_date).format('YYYY-MM-DD')
        });
    }

    // Create the appointment.
    const appointment = await Appointment.create({
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status: 'Scheduled'
    });

    res.status(201).json(appointment);
});

// Get all appointments.
const getAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({})
        .populate({
            path: 'doctor_id',
            populate: [
                { path: 'user_id', select: 'name' },
                { path: 'department_id', select: 'name' }
            ]
        })
        .populate({
            path: 'patient_id',
            populate: {
                path: 'user_id',
                select: 'name'
            }
        });
    res.json(appointments);
});

// Get appointment by ID.
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient_id')
        .populate('doctor_id');

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    res.json(appointment);
});

// Update appointment status.
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found.');
    }

    res.json(appointment);
});

// Update/Reschedule appointment.
const updateAppointment = asyncHandler(async (req, res) => {
    const { appointment_date, appointment_time, status, reminder_sent } = req.body;
    const appointmentId = req.params.id;

    // Find existing appointment.
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // If date or time is being updated, check availability.
    if (appointment_date || appointment_time) {
        const availableSlots = await getAvailableTimeSlots(
            appointment.doctor_id,
            appointment_date || appointment.appointment_date
        );

        // If checking the same day, include current appointment time in available slots.
        if (moment(appointment_date).isSame(appointment.appointment_date, 'day')) {
            availableSlots.push(appointment.appointment_time);
        }

        if (appointment_time && !availableSlots.includes(appointment_time)) {
            res.status(400);
            return res.json({
                message: 'Selected time slot is not available.',
                availableSlots: availableSlots,
                suggestedDate: moment(appointment_date || appointment.appointment_date).format('YYYY-MM-DD')
            });
        }
    }

    // Update only allowed fields.
    const updateFields = {};
    if (appointment_date) updateFields.appointment_date = appointment_date;
    if (appointment_time) updateFields.appointment_time = appointment_time;
    if (status) updateFields.status = status;
    if (reminder_sent !== undefined) updateFields.reminder_sent = reminder_sent;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateFields,
        { new: true }
    ).populate('doctor_id patient_id');

    res.json(updatedAppointment);
});

// Request an appointment
const requestAppointment = asyncHandler(async (req, res) => {
    const { doctor_id, patient_id, appointment_date, appointment_time } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patient_id);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    // Validate doctor exists
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
        res.status(404);
        throw new Error('Doctor not found');
    }

    try {
        const appointmentRequest = await Appointment.create({
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            status: 'Requested',
        });

        res.status(201).json({
            success: true,
            message: 'Appointment requested successfully',
            appointment: appointmentRequest
        });
    } catch (error) {
        res.status(400);
        throw new Error(`Error creating appointment: ${error.message}`);
    }
});

// Request appointment cancellation.
const requestCancellation = asyncHandler(async (req, res) => {
    const { appointment_id } = req.body;

    // Check if appointment exists
    const appointment = await Appointment.findById(appointment_id)
        .populate('doctor_id')
        .populate('patient_id');

    if (!appointment) {
        res.status(404);
        throw new Error("Appointment not found.");
    }

    // Check if appointment can be cancelled
    if (['Cancelled', 'Completed', 'Requested'].includes(appointment.status)) {
        res.status(400);
        throw new Error("Cannot request cancellation for an appointment that is already cancelled or completed or already requested.");
    }

    // Find associated invoice
    const invoice = await Invoice.findOne({ appointment_id: appointment_id });

    // If there's a paid invoice, process refund
    if (invoice && invoice.payment_status === 'Paid' && !invoice.refunded) {
        try {
            // Create refund through Stripe
            const refund = await stripe.refunds.create({
                payment_intent: invoice.payment_intent_id,
            });

            // Update invoice status
            invoice.payment_status = 'Refunded';
            invoice.refunded = true;
            invoice.refund_id = refund.id;
            invoice.refund_date = new Date();
            await invoice.save();
        } catch (error) {
            console.error('Refund processing error:', error);
            // Continue with cancellation even if refund fails
            // But log the error for admin attention
        }
    }

    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointment_id,
        {
            status: 'Cancelled'
        },
        { new: true }
    ).populate('doctor_id patient_id');

    res.status(200).json({
        appointment: updatedAppointment,
        refundProcessed: invoice?.refunded || false
    });
});

const getDailyAppointments = asyncHandler(async (req, res) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours

    const dailyCount = await Appointment.countDocuments({
        status: "Completed", // Ensure only completed appointments are counted
        date_created: { $gte: last24Hours },
    });

    res.json({ dailyCount });
});

const getWeeklyAppointments = asyncHandler(async (req, res) => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Subtract 7 days

    const weeklyCount = await Appointment.countDocuments({
        status: "Completed", // Ensure only completed appointments are counted
        date_created: { $gte: last7Days },
    });

    res.json({ weeklyCount });
});

const getMonthlyAppointments = async (req, res) => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Subtract 30 days

    const monthlyCount = await Appointment.countDocuments({
        appointment_date: { $gte: last30Days },
    });
    console.log("----------------------------------------------monthlyCountOfAppointments", monthlyCount);

    res.json({ monthlyCount });
};

// Get completed appointments with pagination.
const getCompletedAppointments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 7; // Default to 7 results per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const completedAppointments = await Appointment.find({ status: "Completed" })
        .skip(skip)
        .limit(limit)
        .populate('patient_id')
        .populate('doctor_id');

    const totalCount = await Appointment.countDocuments({ status: "Completed" });

    res.json({
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        appointments: completedAppointments,
    });
});

// Get requested or rescheduled appointments with pagination.
const getRequestedAppointments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 7; // Default to 7 results per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const requestedOrRescheduledAppointments = await Appointment.find({ status: { $in: ["Requested", "Rescheduled"] } })
        .skip(skip)
        .limit(limit)
        .populate('patient_id')
        .populate('doctor_id');

    const totalCount = await Appointment.countDocuments({ status: { $in: ["Requested", "Rescheduled"] } });

    res.json({
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        appointments: requestedOrRescheduledAppointments,
    });
});

const getPatientAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({
        patient_id: req.params.id
    })
        .populate({
            path: 'doctor_id',
            populate: [
                { path: 'user_id' },
                { path: 'department_id' }
            ]
        });

    res.json({
        appointments: appointments
    });
});


const getDoctorAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find({
        doctor_id: req.params.id
    })
        .populate({
            path: 'patient_id',
            populate: {
                path: 'user_id',
            }
        });

    res.json({
        appointments: appointments
    });
});

// Get available slots for a doctor on a specific date
const getAvailableSlotsForDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
        res.status(400);
        throw new Error('Doctor ID and date are required');
    }

    const availableSlots = await getAvailableTimeSlots(doctorId, date);

    res.json({
        success: true,
        availableSlots
    });
});


module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    updateAppointment,
    requestAppointment,
    requestCancellation,
    getDailyAppointments,
    getWeeklyAppointments,
    getMonthlyAppointments,
    getCompletedAppointments,
    getRequestedAppointments,
    getPatientAppointments,
    getAvailableSlotsForDoctor,
    getDoctorAppointments
};
