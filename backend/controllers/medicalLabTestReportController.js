const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const transporter = require('../config/emailConfig');
const MedicalLabTestReport = require('../models/MedicalLabTestReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Create a new medical lab test report (Doctor)
const createReport = asyncHandler(async (req, res) => {
    try {
        const report = new MedicalLabTestReport(req.body);
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// View a medical lab test report by ID (Patient/Doctor)
const getReportById = asyncHandler(async (req, res) => {
    try {
        const report = await MedicalLabTestReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search reports based on patient ID
const searchReportsByPatientId = asyncHandler(async (req, res) => {
    try {
        const reports = await MedicalLabTestReport.find({ patient_id: req.params.patientId });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search reports by name and sort by date
const searchReportsByName = asyncHandler(async (req, res) => {
    try {
        const { name } = req.query;
        const reports = await MedicalLabTestReport.find({
            $or: [
                { test_name: { $regex: name, $options: 'i' } },
                { 'doctor_id.user_id.name': { $regex: name, $options: 'i' } }
            ]
        })
            .populate({
                path: 'doctor_id',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            })
            .sort({ test_date: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download report results as PDF
const downloadReport = asyncHandler(async (req, res) => {
    try {
        const report = await MedicalLabTestReport.findById(req.params.id)
            .populate({
                path: 'patient_id',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            })
            .populate({
                path: 'doctor_id',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            });

        if (!report || !report.patient_id || !report.doctor_id) {
            return res.status(404).json({ message: 'Report or associated user not found' });
        }

        // Create a PDF document
        const doc = new PDFDocument();
        const filename = `report_${report._id}.pdf`;

        // Force download headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add content to the PDF with proper spacing
        doc.fontSize(25)
            .text('Medical Lab Test Report', { align: 'center' })
            .moveDown();

        doc.fontSize(12)
            .text(`Patient Name: ${report.patient_id.user_id.name}`)
            .moveDown()
            .text(`Doctor Name: ${report.doctor_id.user_id.name}`)
            .moveDown()
            .text(`Test Name: ${report.test_name}`)
            .moveDown()
            .text(`Results: ${report.result}`)
            .moveDown()
            .text(`Date: ${report.test_date}`)
            .moveDown()
            .text(`Comments: ${report.comments || 'N/A'}`);

        // End the document
        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating PDF', error: error.message });
        }
    }
});

const shareReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        // Fetch the report details
        const report = await MedicalLabTestReport.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Send email
        const mailOptions = {
            from: req.user.email,
            to: email,
            subject: 'Medical Lab Test Report Shared',
            html: `
                <h1>Medical Lab Test Report Details</h1>
                <p>Test Name: ${report.test_name}</p>
                <p>Test Date: ${report.test_date}</p>
                <p>Result: ${report.result}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Report shared successfully' });

    } catch (error) {
        console.error('Share report error:', error);
        res.status(500).json({ message: `Error sharing report: ${error.message}` });
        res.status(500).json({ message: `Error sharing report: ${error.message}` });
    }
};

const getDailyLabReports = asyncHandler(async (req, res) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours

    const dailyCount = await MedicalLabTestReport.countDocuments({
        test_date: { $gte: last24Hours },
    });

    res.json({ dailyCount });
});

const getWeeklyLabReports = asyncHandler(async (req, res) => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Subtract 7 days

    const weeklyCount = await MedicalLabTestReport.countDocuments({
        test_date: { $gte: last7Days },
    });

    res.json({ weeklyCount });
});

const getMonthlyLabReports = async (req, res) => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Subtract 30 days

    const monthlyCount = await MedicalLabTestReport.countDocuments({
        test_date: { $gte: last30Days },
    });
    console.log("----------------------------------------------monthlyCount", monthlyCount);

    res.json({ monthlyCount });
};

const getLabReportsByPatientId = asyncHandler(async (req, res) => {
    try {
        console.log('Received request for patient ID:', req.params.patientId);
        const reports = await MedicalLabTestReport.find({ patient_id: req.params.patientId })
            .populate({
                path: 'doctor_id',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            });

        console.log('Found reports:', reports);
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error in getLabReportsByPatientId:', error);
        res.status(500).json({ message: error.message });
    }
});

const getLabReportsByDoctorId = asyncHandler(async (req, res) => {
    try {
        console.log('Received request for user ID:', req.params.id);

        // First find the doctor document using the userId
        const doctor = await Doctor.findOne({ 'user_id': req.params.id });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Then find all reports where doctor_id matches the doctor's _id
        const reports = await MedicalLabTestReport.find({ doctor_id: doctor._id })
            .populate({
                path: 'patient_id',
                populate: {
                    path: 'user_id',
                    select: 'name'
                }
            })
            .sort({ test_date: -1 });

        console.log('..............................Doctor ID:', doctor._id);

        console.log('Found reports:', reports);
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error in getLabReportsByDoctorId:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    createReport,
    getReportById,
    searchReportsByPatientId,
    searchReportsByName,
    downloadReport,
    shareReport,
    getDailyLabReports,
    getWeeklyLabReports,
    getMonthlyLabReports,
    getLabReportsByPatientId,
    getLabReportsByDoctorId
};