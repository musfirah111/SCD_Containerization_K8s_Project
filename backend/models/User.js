// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Please enter your name.`]
    },
    email: {
        type: String,
        required: [true, `Please enter your email.`],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email.'
        ]
    },
    age: {
        type: Number,
        required: [true, `Please enter your age.`],
    },
    gender: {
        type: String,
        required: [true, 'Please enter the gender.'],
        enum: ['Male', 'Female', 'Other'],
        message: 'Gender should be one of the following: Male, Female, or Other.'
    },
    password: {
        type: String,
        required: [true, `Please enter your password.`],
        minLength: [8, `Password must be at least 8 characters.`]
    },
    phone_number: {
        type: String,
        required: [true, `Please enter your phone number.`],
        match: [
            /^(03[0-9]{2})[0-9]{7}$/,
            'Please enter a valid phone number.'
        ]
    },
    role: {
        type: String,
        enum: ['Admin', 'Doctor', 'Patient'],
        required: [true, `Please enter your role.`],
    },
    profile_picture: {
        type: String,
        required: false,
        default: 'images/default-profile-picture.jpg'
    },
    date_created: {
        type: Date,
        default: Date.now
    }
});

//Middleware used to hash the password of the user before saving.
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//This function is used to compare the entered password with the hashed one.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Move the model creation AFTER defining the middleware
const User = mongoose.model('User', userSchema);

module.exports = User;