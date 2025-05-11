const mongoose = require('mongoose');

const medicalLabTestReportSchema = new mongoose.Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please enter a patient id.']
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Please enter a doctor id.']
    },
    test_name: {
        type: String,
        required: [true, 'Please enter a test name.']
    },
    test_date: {
        type: Date,
        default: Date.now
    },
    result: {
        type: String,
        required: [true, 'Please enter a test result.']
    }
});

// Export the model
const MedicalLabTestReport = mongoose.model('MedicalLabTestReport', medicalLabTestReportSchema);
module.exports = MedicalLabTestReport;
