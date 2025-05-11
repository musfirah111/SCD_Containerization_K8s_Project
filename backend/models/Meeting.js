const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Meeting title is required.'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Meeting organizer is required.']
    },
    participants: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: [true, 'Participant ID is required.']
        }],
        validate: {
            validator: function (array) {
                return array.length > 0;
            },
            message: 'At least one participant is required.'
        }
    },
    date: {
        type: Date,
        required: [true, 'Meeting date is required.']
    },
    time: {
        start: {
            type: String,
            required: [true, 'Start time is required.']
        },
        end: {
            type: String
        }
    },
    location: {
        type: String,
        required: [true, 'Meeting location is required.']
    },
    agenda: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;