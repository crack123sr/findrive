import {httpStatus} from "../config/http.config.js";



export class AppError extends Error {
    constructor(message, statusCode = httpStatus.INTERNAL_SERVER_ERROR, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundException extends AppError {
    constructor(message = "Resource not found", errorCode = "RESOURCE_NOT_FOUND") {
        super(message, httpStatus.NOT_FOUND, errorCode);
    }
}

export class BadRequestException extends AppError {
    constructor(message = "Bad request", errorCode = "BAD_REQUEST") {
        super(message, httpStatus.BAD_REQUEST, errorCode);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
        super(message, httpStatus.UNAUTHORIZED, errorCode);
    }
}

export class InternalServerErrorException extends AppError {
    constructor(message = "Internal server error", errorCode = "INTERNAL_SERVER_ERROR") {
        super(message, httpStatus.INTERNAL_SERVER_ERROR, errorCode);
    }
}


export class HttpException extends AppError {
    constructor(message = "Http exception error", statusCode, errorCode ) {
        super(message, statusCode, errorCode);
    }
}


