const jwt = require("jsonwebtoken");
const settings = require("../config/settings");

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
};

const authMiddleware = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        const decodedToken = jwt.verify(token, settings.JWT_SECRET);
        req.userId = decodedToken._id;
        req.userRole = decodedToken.role;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized — invalid or expired token"
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decodedToken = jwt.verify(token, settings.JWT_SECRET);
            req.userId = decodedToken._id;
            req.userRole = decodedToken.role;
        }
    } catch {
        // ignore invalid token for optional auth
    }
    next();
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
module.exports.extractToken = extractToken;
