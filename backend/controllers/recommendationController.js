const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Get doctor recommendations based on appointment history and ratings
const getDoctorRecommendations = async (req, res) => {
    try {
        const { patientId } = req.body; // Get patientId from request body

        // Get patient's appointments
        const patientAppointments = await Appointment.find({ 
            patient_id: patientId, // Use patientId from body
            status: 'Completed' // Only consider completed appointments
        })
        .populate({
            path: 'doctor_id',
            populate: {
                path: 'department_id'
            }
        })
        .sort({ appointment_date: -1 }); // Get most recent appointments first

        if (!patientAppointments.length) {
            return res.status(404).json({ 
                message: 'No appointment history found for this patient' 
            });
        }

        // Get unique departments from patient's appointment history
        const departmentIds = [...new Set(patientAppointments.map(appointment => 
            appointment.doctor_id.department_id._id.toString()
        ))];

        // Find top-rated doctors from these departments
        const recommendedDoctors = await Doctor.find({
            department_id: { $in: departmentIds },
            availability_status: true
        })
        .populate('user_id', 'name email profile_picture')
        .populate('department_id', 'name')
        .sort({ rating: -1 }) // Sort by rating in descending order
        .limit(5); // Limit to top 5 doctors

        res.status(200).json({
            success: true,
            data: {
                recommendations: recommendedDoctors.map(doctor => ({
                    profilePicture: doctor.user_id.profile_picture,
                    name: doctor.user_id.name,
                    email: doctor.user_id.email,
                    department: doctor.department_id.name,
                    specialization: doctor.specialization,
                    rating: doctor.rating,
                    availability: doctor.availability_status,
                    workingHours: doctor.working_hours,
                    shift: doctor.shift
                }))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recommendations',
            error: error.message
        });
    }
};

module.exports = {
    getDoctorRecommendations
};
