const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}`
            });
        }
        next();
    };
};

module.exports = roleMiddleware;
