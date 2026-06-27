const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controller/authController");
const { updateProfile } = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");
const User = require("../model/user");

const router = express.Router();

router.get("/get-current-user", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/profile", authMiddleware, updateProfile);
router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

module.exports = router;
