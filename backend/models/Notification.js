const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a title.']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please enter a user id.']
    },
    message: {
        type: String,
        required: [true, 'Please enter a message.']
    },
    sent_date: {
        type: Date,
        default: Date.now // Default to the current date and time
    }
});

// Export the model
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
