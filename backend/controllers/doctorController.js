const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Get all doctors with populated data
const getDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({})
        .populate('user_id department_id')
        .select('user_id department_id description specialization qualification shift working_hours availability_status rating experience consultation_fee date_of_joining');
    res.json(doctors);
});

// Get doctor by ID with all details
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('user_id department_id')
        .select('user_id department_id description specialization qualification shift working_hours availability_status rating experience consultation_fee date_of_joining');

    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found.");
    }

    res.json(doctor);
});

// Create a new doctor with all required fields
const createDoctor = asyncHandler(async (req, res) => {
    const {
        user_id,
        description,
        specialization,
        qualification,
        department_id,
        shift,
        working_hours,
        availability_status,
        experience,
        consultation_fee,
        date_of_joining
    } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ user_id });
    if (existingDoctor) {
        res.status(400);
        throw new Error("Doctor already exists for this user ID.");
    }

    // Validate required fields
    if (!experience || experience < 0) {
        res.status(400);
        throw new Error("Please enter valid years of experience.");
    }

    if (!consultation_fee || consultation_fee < 0) {
        res.status(400);
        throw new Error("Please enter valid consultation fee.");
    }

    const doctor = await Doctor.create({
        user_id,
        description,
        specialization,
        qualification,
        department_id,
        shift,
        working_hours,
        availability_status,
        experience,
        consultation_fee,
        date_of_joining: date_of_joining || Date.now()
    });

    res.status(201).json(doctor);
});

// Update doctor information including new fields
const updateDoctor = asyncHandler(async (req, res) => {
    const {
        description,
        specialization,
        qualification,
        department_id,
        shift,
        working_hours,
        availability_status,
        experience,
        consultation_fee
    } = req.body;

    // Validate experience and consultation_fee if they're being updated
    if (experience !== undefined && experience < 0) {
        res.status(400);
        throw new Error("Experience cannot be negative.");
    }

    if (consultation_fee !== undefined && consultation_fee < 0) {
        res.status(400);
        throw new Error("Consultation fee cannot be negative.");
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true // This ensures the schema validations run on update
        }
    ).populate('user_id department_id');

    if (!updatedDoctor) {
        res.status(404);
        throw new Error("Doctor not found.");
    }

    res.json(updatedDoctor);
});

// Delete a doctor.
const deleteDoctor = asyncHandler(async (req, res) => {
    // First find the doctor to get the user_id
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found.");
    }

    // Delete the doctor
    await Doctor.findByIdAndDelete(req.params.id);

    // Delete the corresponding user
    await User.findByIdAndDelete(doctor.user_id);

    res.json({ message: "Doctor and associated user deleted successfully." });
});

// Get doctor's schedule for a specific day.
const getDailySchedule = asyncHandler(async (req, res) => {
    const { doctor_id, date } = req.query;

    let targetDate;
    if (date) {
        targetDate = moment(date).startOf('day');
    } else {
        targetDate = moment().startOf('day');
    }

    // Verify doctor exists.
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    // Get all appointments for the specified day.
    const appointments = await Appointment.find({
        doctor_id,
        appointment_date: {
            $gte: targetDate.toDate(),
            $lte: moment(targetDate).endOf('day').toDate()
        }
    }).populate('patient_id', 'name');

    // Define time slots based on doctor's shift.
    const timeSlots = {
        'Morning': ['09:00', '10:00', '11:00', '12:00'],
        'Evening': ['14:00', '15:00', '16:00', '17:00'],
        'Night': ['18:00', '19:00', '20:00', '21:00']
    };

    // Create schedule with availability.
    const schedule = timeSlots[doctor.shift].map(time => {
        const appointment = appointments.find(apt => apt.appointment_time === time);
        return {
            time,
            isBooked: !!appointment,
            appointment: appointment || null
        };
    });

    res.status(200).json({
        success: true,
        data: {
            date: targetDate.format('YYYY-MM-DD'),
            shift: doctor.shift,
            schedule
        }
    });
});

// Get doctor's schedule for a week.
const getWeeklySchedule = asyncHandler(async (req, res) => {
    const { doctor_id, start_date } = req.query;

    let weekStart;
    if (start_date) {
        weekStart = moment(start_date).startOf('week');
    } else {
        weekStart = moment().startOf('week');
    }
    const weekEnd = moment(weekStart).endOf('week');

    // Verify doctor exists.
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    // Get all appointments for the week.
    const appointments = await Appointment.find({
        doctor_id,
        appointment_date: {
            $gte: weekStart.toDate(),
            $lte: weekEnd.toDate()
        }
    }).populate('patient_id', 'name');

    // Create weekly schedule.
    const weeklySchedule = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = moment(weekStart).add(i, 'days');
        const dayAppointments = appointments.filter(apt =>
            moment(apt.appointment_date).isSame(currentDate, 'day')
        );

        weeklySchedule.push({
            date: currentDate.format('YYYY-MM-DD'),
            dayOfWeek: currentDate.format('dddd'),
            appointments: dayAppointments.map(apt => ({
                time: apt.appointment_time,
                patient: apt.patient_id,
                status: apt.status
            }))
        });
    }

    res.status(200).json({
        success: true,
        data: {
            weekStart: weekStart.format('YYYY-MM-DD'),
            weekEnd: weekEnd.format('YYYY-MM-DD'),
            shift: doctor.shift,
            weeklySchedule
        }
    });
});

// Get all doctors with pagination and include new fields
const getAllDoctors = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    // Add sorting options
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Add filtering options
    const filter = {};
    if (req.query.experience) {
        filter.experience = { $gte: parseInt(req.query.experience) };
    }
    if (req.query.maxFee) {
        filter.consultation_fee = { $lte: parseInt(req.query.maxFee) };
    }

    const doctors = await Doctor.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user_id department_id')
        .select('user_id department_id description specialization qualification shift working_hours availability_status rating experience consultation_fee date_of_joining');

    const totalDoctors = await Doctor.countDocuments(filter);

    res.json({
        totalDoctors,
        totalPages: Math.ceil(totalDoctors / limit),
        currentPage: page,
        doctors,
    });
});


// Get the count of doctors in each department
const getDoctorCountByDepartment = asyncHandler(async (req, res) => {
    const doctorCountByDepartment = await Doctor.aggregate([
        {
            $group: {
                _id: "$department_id",
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $project: {
                department_id: "$_id",
                count: 1,
                department_name: { $arrayElemAt: ["$department.name", 0] }
            }
        }
    ]);

    res.json(doctorCountByDepartment);
});

// Get doctor's schedule for a specific date
const getDoctorSchedule = asyncHandler(async (req, res) => {
    const { doctorId, date } = req.params;
    console.log("doctorId", doctorId, "date", date);

    // Get doctor using userId
    const doctor = await Doctor.findOne({ user_id: doctorId });
    if (!doctor) {
        return res.status(404).json({
            success: false,
            error: 'Doctor not found'
        });
    }

    // Convert the date string to a Date object
    const queryDate = new Date(date);
    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const appointments = await Appointment.find({
        doctor_id: doctor._id,
        appointment_date: {
            $gte: queryDate,
            $lt: nextDate
        }
    });

    console.log("************************************************appointments", appointments);

    // Add null checks when mapping appointments
    const mappedAppointments = await Promise.all(appointments.map(async apt => {
        const patient_id = apt.patient_id.toString();
        const patient = await Patient.findById(patient_id);
        const patientUser = patient ? await User.findById(patient.user_id) : null;

        return {
            id: apt._id,
            time: apt.appointment_time,
            patientName: patientUser?.name,
            patientEmail: patientUser?.email,
            patientPhone: patientUser?.phone_number,
            status: apt.status
        };
    }));

    console.log("***********************mappedAppointments", mappedAppointments);

    res.json({
        success: true,
        data: {
            appointments: mappedAppointments,
            workingHours: doctor.working_hours,
            shift: doctor.shift
        }
    });
});
//get doctor details by user id
const getDoctorDetailsByUserId = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user_id: req.params.id });
    console.log("************************************************doctor", doctor);
    res.json(doctor);
});

// Calculate total revenue from appointments
const calculateRevenue = asyncHandler(async (req, res) => {
    // Get all completed appointments
    const appointments = await Appointment.find({ status: 'completed' })
        .populate({
            path: 'doctor_id',
            select: 'consultation_fee'
        });

    // Calculate total revenue
    const totalRevenue = appointments.reduce((sum, appointment) => {
        return sum + (appointment.doctor_id?.consultation_fee || 0);
    }, 0);

    console.log("----------------------------------------------totalRevenue", totalRevenue);

    res.json({
        success: true,
        revenue: totalRevenue,
        appointmentCount: appointments.length
    });
});


// Update consultation fee for a doctor
const updateConsultationFee = asyncHandler(async (req, res) => {
    const { consultation_fee } = req.body;

    // Validate consultation fee
    if (!consultation_fee || consultation_fee < 0) {
        res.status(400);
        throw new Error("Please provide a valid consultation fee (must be greater than 0)");
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { consultation_fee },
        {
            new: true,
            runValidators: true
        }
    ).populate('user_id department_id');

    if (!updatedDoctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    res.json(updatedDoctor);
});

// Update doctor's experience
const updateDoctorExperience = asyncHandler(async (req, res) => {
    const { experience } = req.body;
    const doctorId = req.params.id;

    // Validate experience
    if (experience === undefined || experience < 0) {
        res.status(400);
        throw new Error("Please provide valid years of experience (must be 0 or greater)");
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { experience },
        {
            new: true,
            runValidators: true
        }
    ).populate('user_id department_id');

    if (!updatedDoctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }

    res.json(updatedDoctor);
});



module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDailySchedule,
    getWeeklySchedule,
    getAllDoctors,
    getDoctorCountByDepartment,
    getDoctorSchedule,
    getDoctorDetailsByUserId,
    calculateRevenue,
    updateConsultationFee,
    updateDoctorExperience
};
