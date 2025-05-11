const asyncHandler = require('express-async-handler');
const Review = require('../models/RatingAndReview');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Add a review (Patient)
const addReview = asyncHandler(async (req, res) => {
    const { doctor_id, patient_id, rating, review } = req.body;

    try {
        // Verify if the doctor exists
        const doctorExists = await Doctor.findById(doctor_id);
        if (!doctorExists) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Verify if the patient exists
        const patientExists = await Patient.findById(patient_id);
        if (!patientExists) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create and save the review
        const newReview = new Review({
            doctor_id,
            patient_id,
            rating,
            review: review || '' // Handle optional review text
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a review (Admin)
const deleteReview = asyncHandler(async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// View all reviews with patient and doctor names
const getAllReviews = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate({
                path: 'patient_id',
                model: 'Patient'
            })
            .populate({
                path: 'doctor_id',
                model: 'Doctor',
                populate: [
                    {
                        path: 'user_id',
                        select: 'name',
                        model: 'User'
                    },
                    {
                        path: 'department_id',
                        select: 'name',
                        model: 'Department'
                    }
                ]
            });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews for a specific doctor
const getReviewsByDoctorReviews = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find({ doctor_id: req.params.id })
            .sort({ createdAt: -1 })
            .select('review rating createdAt'); // Select review, rating and date

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews for a specific doctor
const getReviewsByDoctor = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find({ doctor_id: req.params.id })
            .populate({
                path: 'patient_id',
                select: 'name',
                model: 'Patient'
            })
            .sort({ createdAt: -1 }); // Sort by newest first

        // Transform the data to match the frontend expectations
        const formattedReviews = reviews.map(review => ({
            id: review._id,
            rating: review.rating,
            comment: review.review,
            date: review.createdAt,
            patientName: review.patient_id.name
        }));

        res.status(200).json(formattedReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export the controller functions
module.exports = {
    addReview,
    deleteReview,
    getAllReviews,
    getReviewsByDoctor,
    getReviewsByDoctorReviews
};