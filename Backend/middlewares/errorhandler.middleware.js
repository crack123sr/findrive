import {httpStatus} from "../config/http.config.js";
import { AppError } from "../utils/app-error.js";
import { z, ZodError } from "zod";
import { MulterError } from "multer";


const formatZodError = (res, error) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(httpStatus.BAD_REQUEST).json({
    message: "Validation failed",
    errors: errors,
  });
};

const handleMulterError = (error) => {
  const messages = {
    LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
    LIMIT_FILE_SIZE: "File size exceeds the limit",
    LIMIT_FILE_COUNT: "Too many files uploaded",
    default: "File upload error",
  };

  return {
    status: httpStatus.BAD_REQUEST,
    message: messages[error.code] || messages.default,
    error: error.message,
  };
};



export const errorHandler = (err, req, res, next) => {
    console.log("Error occured on PATH: ", req.path,"Error: ", err);

    
  if (err instanceof ZodError) {
    return formatZodError(res, err);
  }

  if (err instanceof MulterError) {
      const { status, message, error: err } = handleMulterError(err);
      return res.status(status).json({
        message,
        error: err,
        errorCode: "MULTER_ERROR",
      });
    }
  


    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
            errorCode: err.errorCode,
        });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({  
        message: "Internal Server Error",
        error: err.message || "An unexpected error occurred",
    });
}