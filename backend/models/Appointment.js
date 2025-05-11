// backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, `Please enter the patient id.`]
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, `Please enter the doctor id.`]
    },
    appointment_date: {
        type: Date,
        required: [true, `Please enter the appointment date.`]
    },
    appointment_time: {
        type: String,
        required: [true, `Please enter the appointment time.`]
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'Requested'],
        default: 'Scheduled'
    },
    reminder_sent: {
        type: Boolean,
        default: false
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
