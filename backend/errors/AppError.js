class AppError extends Error{
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
  constructor(message, fields) { super(message, 400, true, { fields }); }
}
class NotFoundError extends AppError {
  constructor(resource, id) { super(`${resource} ${id} not found`, 404); }
}
class ConflictError extends AppError {
  constructor(message) { super(message, 409); }
}

module.exports = AppError;