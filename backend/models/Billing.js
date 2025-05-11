const mongoose = require('mongoose');
const { Schema } = mongoose;

const billingSchema = new Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please enter the patient ID.']
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Please enter the appointment ID.']
    },
    total_amount: {
        type: Number,
        required: [true, 'Please enter the total amount.']
    },
    amount_paid: {
        type: Number,
        default: 0
    },
    payment_status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Refunded'],
        default: 'Unpaid'
    },
    payment_method: {
        type: String,
        required: false
    },
    date_of_payment: {
        type: Date,
        required: false
    },
    stripe_invoice_id: {
        type: String,
        required: false
    },
    payment_intent_id: {
        type: String,
        required: false
    },
    due_date: {
        type: Date,
        required: false
    }
});

const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
