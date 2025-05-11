const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RatingAndReview', ratingAndReviewSchema);
