const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    sender_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please enter a sender id.']
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please enter a receiver id.']
    },
    message_content: {
        type: String,
        required: [true, 'Please enter a message content.']
    },
    is_read: {
        type: Boolean,
        default: false // Default to false
    },
    date_sent: {
        type: Date,
        default: Date.now // Default to the current date and time
    }

});

// Export the model
const Communication = mongoose.model('Communication', communicationSchema);
module.exports = Communication;
