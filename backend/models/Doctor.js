const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please enter a user id.']
    },
    description: {
        type: String,
        required: [true, 'Please enter doctor description.']
    },
    specialization: {
        type: String,
        required: [true, 'Please enter a specialization.']
    },
    qualification: {
        type: [String],
        required: [true, 'Please enter at least one qualification.']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Please enter a department id.']
    },
    shift: {
        type: String,
        required: [true, 'Please enter a shift.'],
        enum: ['Morning', 'Evening', 'Night', 'Afternoon']
    },
    working_hours: {
        type: String,
        required: [true, 'Please enter a working hours.']
    },
    availability_status: {
        type: Boolean,
        default: true,
        required: [true, 'Please enter a availability status.']
    },
    rating: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        required: [true, 'Please enter years of experience.'],
        min: [0, 'Experience cannot be negative.']
    },
    consultation_fee: {
        type: Number,
        required: [true, 'Please enter consultation fee.'],
        min: [0, 'Consultation fee cannot be negative.']
    },
    date_of_joining: {
        type: Date,
        default: Date.now,
        required: [true, 'Please enter a date of joining.']
    }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;

