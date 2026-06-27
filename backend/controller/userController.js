const User = require("../model/user");
const AuthUtil = require("../utils/authUtil");

const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is required to set a new password"
                });
            }
            const valid = await AuthUtil.validatePassword(currentPassword, user.password);
            if (!valid) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 6 characters"
                });
            }
            user.password = await AuthUtil.hashPassword(newPassword);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { updateProfile };
