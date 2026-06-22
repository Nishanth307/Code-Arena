const User = require("../model/user");

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error during authorization check."
        });
    }
};

module.exports = adminMiddleware;
