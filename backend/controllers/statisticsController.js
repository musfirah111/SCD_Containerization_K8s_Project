const asyncHandler = require('express-async-handler');
const Doctor = require('../models/Doctor');
const RatingAndReview = require('../models/RatingAndReview');
const Appointment = require('../models/Appointment');

// Get average rating for a specific doctor.
const getDoctorRating = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;

    const reviews = await RatingAndReview.find({ doctor_id });

    if (reviews.length === 0) {
        return res.json({ averageRating: 0, totalReviews: 0 });
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    res.json({
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length
    });
});

// Get top rated doctors by department.
const getTopRatedDoctorsByDepartment = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || 5);

        // Get all doctors with valid department and user references
        const doctors = await Doctor.find({
            department_id: { $ne: null },
            user_id: { $ne: null }
        })
            .populate('user_id', 'name')
            .populate('department_id', 'name')
            .lean()
            .exec();

        if (!doctors || doctors.length === 0) {
            return res.json({ message: 'No doctors found' });
        }

        const departmentDoctors = {};

        // Safe access to properties
        doctors.forEach(doctor => {
            if (doctor?.department_id?._id && doctor?.user_id?.name) {
                const deptId = doctor.department_id._id.toString();
                if (!departmentDoctors[deptId]) {
                    departmentDoctors[deptId] = {
                        department_name: doctor.department_id.name,
                        doctors: []
                    };
                }
                departmentDoctors[deptId].doctors.push(doctor);
            }
        });

        const departmentRatings = {};

        for (const [deptId, data] of Object.entries(departmentDoctors)) {
            const ratings = [];

            for (const doctor of data.doctors) {
                const reviews = await RatingAndReview.find({
                    doctor_id: doctor._id,
                    rating: { $exists: true }
                });

                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                    : 0;

                ratings.push({
                    doctor_name: doctor.user_id.name,
                    department: data.department_name,
                    averageRating: Number(avgRating.toFixed(1))
                });
            }

            ratings.sort((a, b) => b.averageRating - a.averageRating);
            departmentRatings[deptId] = {
                department_name: data.department_name,
                top_rated: ratings.slice(0, limit)
            };
        }

        return res.json(departmentRatings);

    } catch (error) {
        console.error('Error in getTopRatedDoctorsByDepartment:', error);
        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
});

const getDoctorStats = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;
    try {
        // Get doctor's rating
        const reviews = await RatingAndReview.find({ doctor_id });
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        // Get number of unique patients
        const uniquePatients = await Appointment.distinct('patient_id', {
            doctor_id,
            status: 'Completed'
        });

        res.json({
            success: true,
            stats: {
                rating: parseFloat(averageRating.toFixed(1)),
                totalPatients: uniquePatients.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    getDoctorRating,
    getTopRatedDoctorsByDepartment,
    getDoctorStats
};
