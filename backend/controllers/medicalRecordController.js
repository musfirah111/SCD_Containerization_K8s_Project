const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');

// Create a new medical record (Doctor)
const createRecord = asyncHandler(async (req, res) => {
    try {
        const record = new MedicalRecord(req.body);
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// View a medical record by ID (Patient/Doctor)
const getRecordById = asyncHandler(async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search records based on patient ID
const searchRecordsByPatientId = asyncHandler(async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient_id: req.params.patientId });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search records by name and sort by date
const searchRecordsByName = asyncHandler(async (req, res) => {
    try {
        const records = await MedicalRecord.find({ name: req.query.name }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getRecordsByPatientId = asyncHandler(async (req, res) => {
    try {
        console.log('Received request for patient ID:', req.params.patientId);

        const records = await MedicalRecord.find({ patient_id: req.params.patientId })
            .populate({
                path: 'doctor_id',
                populate: {
                    path: 'user_id',
                    select: 'name  profile_picture'
                }
            })
            .populate({
                path: 'treatment', // Populate the `treatment` field directly as it references `Prescription`
                select: 'medications instructions date_issued status'
            });

        if (!records || records.length === 0) {
            console.error('No records found for patient ID:', req.params.patientId);
            return res.status(404).json({ message: 'No medical records found for this patient.' });
        }

        console.log('Found records:', records);
        res.status(200).json(records);
    } catch (error) {
        console.error('Error in getRecordsByPatientId:', error.message);
        res.status(500).json({ message: 'An error occurred while retrieving medical records.' });
    }
});

const getRecordsByDoctorId = asyncHandler(async (req, res) => {
    try {
        console.log('Received request for doctor ID:', req.params.doctorId);

        const records = await MedicalRecord.find({ doctor_id: req.params.doctorId })
            .populate({
                path: 'patient_id',
                populate: {
                    path: 'user_id',
                    select: 'name email'
                }
            })
            .populate({
                path: 'treatment', // Populate the `treatment` field directly as it references `Prescription`
                select: 'medications instructions date_issued status'
            });

        if (!records || records.length === 0) {
            console.error('No records found for doctor ID:', req.params.doctorId);
            return res.status(404).json({ message: 'No medical records found for this doctor.' });
        }

        console.log('Found records:', records);
        res.status(200).json(records);
    } catch (error) {
        console.error('Error in getRecordsByDoctorId:', error.message);
        res.status(500).json({ message: 'An error occurred while retrieving medical records.' });
    }
});

// Export the controller functions
module.exports = {
    createRecord,
    getRecordById,
    searchRecordsByPatientId,
    searchRecordsByName,
    getRecordsByPatientId,
    getRecordsByDoctorId
};