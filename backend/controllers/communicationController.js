const StreamChat = require('stream-chat').StreamChat;
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Add debug logging for initialization
console.log('Initializing Stream Chat with:', {
    apiKey: process.env.STREAM_API_KEY,
    hasSecret: !!process.env.STREAM_API_SECRET // Log if secret exists without exposing it
});

// Initialize Stream Chat
const serverClient = new StreamChat(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

const initializeChat = async (req, res) => {
    try {
        const { userId, userType } = req.body;
        console.log('Initializing chat for:', { userId, userType });

        let userData;
        if (userType === 'doctor') {
            userData = await Doctor.findById(userId).populate('user_id');
        } else {
            userData = await Patient.findById(userId).populate('user_id');
        }

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        try {
            // Generate user token
            const token = serverClient.createToken(userId);

            // Create or update the user in Stream
            await serverClient.upsertUser({
                id: userId,
                role: 'user',
                name: userData.user_id.name,
                custom: {
                    userType: userType,
                    isDoctor: userType === 'doctor'
                }
            });

            res.status(200).json({
                success: true,
                token,
                apiKey: process.env.STREAM_API_KEY
            });
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            throw new Error(`Token generation failed: ${tokenError.message}`);
        }
    } catch (error) {
        console.error('Full error object:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing chat',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const createChannel = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;

        // Create a unique channel ID
        const channelId = `${doctorId}-${patientId}`;

        const channel = serverClient.channel('messaging', channelId, {
            members: [doctorId, patientId],
            created_by_id: req.user.id
        });

        await channel.create();

        res.status(201).json({
            success: true,
            channelId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating chat channel',
            error: error.message
        });
    }
};

// Get channel details
const getChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        console.log('Getting channel:', channelId);

        const channel = serverClient.channel('messaging', channelId);
        
        // Query channel
        const state = await channel.query({
            state: true,
            messages: { limit: 30 }  // Get last 30 messages
        });

        if (!state.channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        res.status(200).json({
            success: true,
            channel: state.channel,
            messages: state.messages
        });
    } catch (error) {
        console.error('Get channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving channel',
            error: error.message
        });
    }
};

// Delete channel with additional checks and cleanup
const deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.body;
        console.log('Deleting channel:', channelId);

        // Get channel instance
        const channel = serverClient.channel('messaging', channelId);

        // Verify channel exists
        const { channel: channelData } = await channel.query();
        
        if (!channelData) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Optional: Verify user has permission to delete
        const userId = req.user.id; // Assuming you have user info in request
        if (!channelData.members.some(member => member.user_id === userId)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this channel'
            });
        }

        // Delete the channel
        await channel.delete();

        // Optional: Perform any additional cleanup
        // For example, update your local database if you're tracking channels

        res.status(200).json({
            success: true,
            message: 'Channel deleted successfully',
            channelId
        });
    } catch (error) {
        console.error('Delete channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting channel',
            error: error.message
        });
    }
};

module.exports = {
    initializeChat,
    createChannel,
    getChannel,
    deleteChannel
};
