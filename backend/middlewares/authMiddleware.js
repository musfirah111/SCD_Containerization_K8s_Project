const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as necessary

const protect = async (req, res, next) => {
    console.log('Inside Middleware');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure you have the correct secret
            req.user = await User.findById(decoded.id).select('-password'); // Fetch user and exclude password
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            console.log('Token:', token); // Log the token
            console.log('Decoded Token:', decoded); // Log the decoded token
            console.log('User:', req.user); // Log the user fetched from the database

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };