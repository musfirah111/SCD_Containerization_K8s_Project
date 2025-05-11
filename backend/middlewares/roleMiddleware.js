const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');

// Middleware to check if user has required role
const checkRole = (roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized - insufficient permissions' });
        }

        next();
    });
};

// Specific role middleware functions
const adminOnly = checkRole(['Admin']);
const doctorOnly = checkRole(['Doctor']);
const patientOnly = checkRole(['Patient']);

const adminOrPatient = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'Admin') {
        return next();
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.user_id.toString() === req.user.id) {
        return next();
    }

    res.status(403).json({ message: 'Not authorized' });
});

module.exports = { checkRole, adminOnly, doctorOnly, patientOnly, adminOrPatient };