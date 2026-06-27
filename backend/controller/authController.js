const settings = require("../config/settings");
const User = require("../model/user");
const AuthUtil = require("../utils/authUtil");

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!(firstName && lastName && email && password)) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // existing user check
        const userData = await User.findOne({ email: email.toLowerCase() });
        if (userData) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hashed Password
        const hashedPassword = await AuthUtil.hashPassword(password);

        // create new user
        const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "USER"
        });

        // generate tokens 
        const accessToken = await AuthUtil.generateToken({
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role
        });

        const userResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role
        };

        // Set HttpOnly cookie for the authentication token
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userResponse,
            token: accessToken
        });
    }
    catch (error) {
        console.error("Registration error", error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        } else if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Internal Server error during registration"
            });
        }
    }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const userData = await User.findOne({ email: email.toLowerCase() })
        if (!userData) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = userData;
        const isPasswordValid = await AuthUtil.validatePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const accessToken = await AuthUtil.generateToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });

        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        // Set HttpOnly cookie for the authentication token
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: settings.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: userResponse,
            token: accessToken
        });
    }
    catch (error) {
        console.error("Login error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};

/**
 * Logout a user
 * @route POST /api/auth/logout
 */
const logoutUser = async (req, res) => {
    try {
        // Clear HttpOnly cookie on logout
        res.clearCookie("token", {
            httpOnly: true,
            secure: settings.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    }
    catch (error) {
        console.error("Logout error", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during logout"
        });
    }
};

module.exports = { registerUser, loginUser, logoutUser };
