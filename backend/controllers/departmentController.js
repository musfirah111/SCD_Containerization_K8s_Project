const asyncHandler = require('express-async-handler');
const Department = require('../models/Department'); // Assuming you have a Department model
const Patient = require('../models/Patient'); // Make sure to import Patient model
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Add a new department
const addDepartment = async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a department
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a department
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({});
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update department status
const updateDepartmentStatus = async (req, res) => {
    try {
        const { active_status } = req.body;
        if (typeof active_status !== 'boolean') {
            return res.status(400).json({ message: 'Active status must be a boolean value' });
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { active_status },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.status(200).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
        const getAllDepartments = async (req, res) => {
            const departments = await Department.find({ active_status: true });
            res.json(departments);
        }
    };
}

const getDepartmentPatientStats = async (req, res) => {
    try {
        // Get all active departments
        const departments = await Department.find({ active_status: true });

        // Get total unique patients with appointments
        const uniquePatients = await Patient.distinct('_id', {
            '_id': { $in: await Appointment.distinct('patient_id') }
        });
        const totalPatients = uniquePatients.length;

        // Get patient counts for each department
        const departmentStats = await Promise.all(
            departments.map(async (dept) => {
                // Get all doctors in this department
                const doctorIds = await Doctor.distinct('_id', { department: dept._id });

                // Get unique patients who have appointments with these doctors
                const uniqueDeptPatients = await Patient.distinct('_id', {
                    '_id': {
                        $in: await Appointment.distinct('patient_id', {
                            doctor_id: { $in: doctorIds },
                            active_status: true
                        })
                    }
                });
                const patientCount = uniqueDeptPatients.length;

                // Calculate percentage
                const percentage = totalPatients > 0
                    ? Math.round((patientCount / totalPatients) * 100)
                    : 0;

                return {
                    department: dept.name,
                    value: patientCount,
                    percentage: `${percentage}%`
                };
            })
        );
        console.log("----------------------------------------------departmentStatsssss4s", departmentStats);
        res.json(departmentStats);
    } catch (error) {
        console.error('Error in getDepartmentPatientStats:', error);
        res.status(500).json({
            message: 'Error fetching department statistics',
            error: error.message
        });
    }
};

// Export the controller functions
module.exports = {
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getAllDepartments,
    updateDepartmentStatus,
    getDepartmentPatientStats
};
