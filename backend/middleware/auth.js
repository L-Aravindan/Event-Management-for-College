const jwt = require('jsonwebtoken');

// Middleware to authenticate users
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role }; // Attach user data to the request object
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Middleware to ensure only admin can access certain routes
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admin can perform this action.' });
    }
    next();
};

module.exports = authMiddleware;
module.exports.isAdmin = isAdmin;