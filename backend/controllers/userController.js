// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');

//Generate JWT.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

//Register a new user.
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, createdAt, age, gender, phone_number, profile_picture } = req.body;

    if (!name || !email || !password || !role || !age || !gender || !phone_number) {
        res.status(400);
        throw new Error("Please add all fields.");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists.");
    }

    //const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password,
        role,
        createdAt,
        age,
        gender,
        phone_number,
        profile_picture
    });

    await user.save();

    if (user) {
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            age: user.age,
            gender: user.gender,
            phone_number: user.phone_number,
            profile_picture: user.profile_picture,
            token: generateToken(user.id)
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data.");
    }
});

//Login a user.
const loginUser = asyncHandler(async (req, res) => {
    console.log("----LOGIN---------------------------------------------");
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        user.lastlogin = Date.now();
        await user.save();
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastlogin: user.lastlogin,
            token: generateToken(user.id)
        });
    } else {
        res.status(401);
        throw new Error("Invalid credentials.");
    }
});

//Get user profile.
const getUserProfile = asyncHandler(async (req, res) => {
    console.log('Request User:', req.user);

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.phone_number = req.body.phone_number || user.phone_number;
    user.address = req.body.address || user.address;
    // Add other fields as necessary

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        // Return other fields as necessary
    });
});

const updateUserByUserId = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    console.log(".........................///phone number:", req.body.phone_number);
    // Update patient fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.phone_number = req.body.phone_number || user.phone_number;
    user.address = req.body.address || user.address;
    // Add other patient-specific fields as needed

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
    });
});

const getUserProfileById = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('-password');
    console.log(".........................///user:", user);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

//Get user by email.
const getUserByEmail = asyncHandler(async (req, res) => {
    const email = req.params.email;
    const user = await User.findOne({ email });
    res.json(user);
});

const updateProfilePicture = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.profile_picture = req.body.profile_picture;
    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        profile_picture: updatedUser.profile_picture
    });
});

const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({
        message: 'Password updated successfully'
    });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    updateUserByUserId,
    getUserProfileById,
    getUserByEmail,
    updateProfilePicture,
    updatePassword
};