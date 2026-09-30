import express from "express";

const { request, response, NextFunction } = express;


export const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        next(err);
    }
};
