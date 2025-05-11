const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please enter a patient ID.']
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Please enter a doctor ID.']
    },
    diagnosis: {
        type: String,
        required: [true, 'Please enter the diagnosis.'],
        maxlength: [1000, 'Diagnosis cannot be longer than 1000 characters.']
    },
    treatment: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Prescription',
            required: [true, 'Please enter prescription IDs.']
        }],
        required: [true, 'At least one treatment must be specified.']
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
