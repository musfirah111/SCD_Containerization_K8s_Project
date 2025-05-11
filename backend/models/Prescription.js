const mongoose = require('mongoose');
const { Schema } = mongoose;

const prescriptionSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please enter the patient ID.']
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Please enter the doctor ID.']
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Please enter the appointment ID.']
    },
    medications: {
        type: [{
            name: {
                type: String,
                required: [true, 'Please enter the medication name.']
            },
            dosage: {
                type: String,
                required: [true, 'Please enter the dosage.']
            },
            frequency: {
                type: String,
                required: [true, 'Please enter the frequency.']
            },
            duration: {
                type: String,
                required: [true, 'Please enter the duration.']
            }
        }],
        validate: {
            validator: function (array) {
                return array.length > 0;
            },
            message: 'At least one medication is required'
        }
    },
    instructions: {
        type: String,
        required: false
    },
    date_issued: {
        type: Date,
        required: [true, 'Please enter the date issued.'],
        default: Date.now
    },
    tests: [{
        test_name: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
