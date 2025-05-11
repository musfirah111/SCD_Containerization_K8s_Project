const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model.
        required: [true, 'Please enter a user ID.']
    },
    address: {
        type: String,
        required: false,
        minlength: [10, 'Address should be at least 10 characters long.'],
        maxlength: [200, 'Address cannot be longer than 200 characters.']
    },
    emergency_contact: {
        type: {
            name: {
                type: String,
                required: [true, 'Please enter the contact\'s name.']
            },
            phone: {
                type: String,
                required: [true, 'Please enter the contact\'s phone number.'],
                match: [/^(03[0-9]{2})[0-9]{7}$/, 'Phone number must be 10 digits long.']
            },
            relationship: {
                type: String,
                required: [true, 'Please enter the relationship to the patient.']
            }
        }
    },
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
