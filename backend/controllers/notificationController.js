const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');


const getNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if userId is valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const notifications = await Notification.find({ user_id: userId }).sort({ sent_date: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = {
    getNotifications,
};

