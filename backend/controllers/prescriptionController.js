const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor');
const cron = require('node-cron');

// Create a new prescription
const createPrescription = asyncHandler(async (req, res) => {
    const { patient_id, doctor_id, appointment_id, medications, instructions, tests, status } = req.body;

    // Set default status if not provided
    const prescriptionStatus = status || 'active'; // Default to 'active' if status is not provided

    // Check if patient and doctor exist
    const patientExists = await Patient.findById(patient_id);
    const doctorExists = await Doctor.findById(doctor_id);

    if (!patientExists || !doctorExists) {
        res.status(404);
        throw new Error("Patient or Doctor not found.");
    }

    const prescription = await Prescription.create({
        patient_id,
        doctor_id,
        appointment_id,
        medications,
        instructions,
        tests,
        status: prescriptionStatus // Use the determined status
    });

    console.log('Created Prescription:', prescription); // Log the created prescription
    res.status(201).json(prescription);
});

// Update an existing prescription
const updatePrescription = asyncHandler(async (req, res) => {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!prescription) {
        res.status(404);
        throw new Error("Prescription not found.");
    }

    res.json(prescription);
});

// View specific prescriptions by doctor or patient
const getPrescriptionById = asyncHandler(async (req, res) => {

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
        res.status(404);
        throw new Error("Prescription not found.");
    }

    res.json(prescription);
});

// Get active prescriptions of a specific patient
const getActivePrescriptionsByPatientId = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({ patient_id: req.params.id, status: 'active' })
    .populate({
        path: 'doctor_id',
        populate: {
            path: 'user_id',
            select: 'name  profile_picture'
        }
    });

    if (!prescriptions) {
        res.status(404);
        throw new Error("Prescriptions not found.");
    }

    res.json(prescriptions);
});

// Get active prescriptions of a specific doctor
const getActivePrescriptionsByDoctorId = asyncHandler(async (req, res) => {
    console.log('Searching for doctor ID:', req.params.id);
    
    const prescriptions = await Prescription.find({ 
        doctor_id: req.params.id, 
        status: 'active' 
    })
    .populate({
        path: 'patient_id',
        populate: {
            path: 'user_id',
             select: 'name email profile_picture'
        }
    })
    .populate('appointment_id')
    .sort({ date_issued: -1 });

    console.log('Found prescriptions:', prescriptions);

    res.json(prescriptions || []);
});

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const prescriptions = await Prescription.find({ status: 'active' });

        for (const prescription of prescriptions) {
            const medications = prescription.medications;

            // Find the largest duration
            const largestDuration = medications.reduce((max, med) => {
                const duration = parseInt(med.duration); // Assuming duration is a string representing a number
                return Math.max(max, isNaN(duration) ? 0 : duration); // Handle NaN case
            }, 0);

            // Calculate the date when the status should change
            const changeDate = new Date();
            changeDate.setDate(changeDate.getDate() + largestDuration);

            // Check if the current date is past the change date
            const now = new Date();
            if (now >= changeDate) {
                prescription.status = 'inactive';
                await prescription.save(); // Save the updated status
                console.log('Prescription status updated successfully.');
            }
        }
    } catch (error) {
        console.error('Error updating prescription status:', error);
    }
});

// View all prescriptions
const getAllPrescriptions = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({});
    res.json(prescriptions);
});


// Get prescriptions by appointment ID
const getPrescriptionsByAppointmentId = asyncHandler(async (req, res) => {
    const prescriptions = await Prescription.find({ appointment_id: req.params.id });
    res.json(prescriptions);
});




module.exports = {
    createPrescription,
    updatePrescription,
    getPrescriptionById,
    getAllPrescriptions,
    getActivePrescriptionsByPatientId,
    getActivePrescriptionsByDoctorId,
    getPrescriptionsByAppointmentId
};
