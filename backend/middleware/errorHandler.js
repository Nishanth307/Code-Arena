const errorHandler = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(val => val.message)
            .join(" ");
    }

    // Mongoose Duplicate Key Error (MongoDB code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "";
        if (field === "email") {
            message = "An account with this email already exists.";
        } else {
            message = `Duplicate field value entered for: ${field}`;
        }
    }

    // Mongoose Cast Error (invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 404;
        message = `Resource not found: invalid ID for ${err.path}`;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
};

module.exports = errorHandler;