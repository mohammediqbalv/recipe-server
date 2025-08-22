const users = require('../Models/userSchema');

const adminMiddleware = async (req, res, next) => {
    try {
        const userId = req.payload; // This comes from JWT middleware
        
        // Find the user and check if they are an admin
        const user = await users.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        // Add user info to request for use in controllers
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = adminMiddleware; 