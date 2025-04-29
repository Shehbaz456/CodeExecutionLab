import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.refreshToken; 

    if (!token) {
        throw new ApiError(401, "Unauthorized - No token provided");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Unauthorized - Invalid or Expired token");
    }

    const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            coverImage: true,
        },
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    req.user = user; 
    next();
});

// Middleware to allow only admins
export const checkAdmin = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
        throw new ApiError(403, "Access denied - Admins only");
    }

    next();
});
