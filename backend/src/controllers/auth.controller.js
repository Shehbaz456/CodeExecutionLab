import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


/** Generate Access Token and Refresh Token */

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        await db.user.update({
            where: { id: userId },
            data: { refreshToken },
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};


export const registerUser = asyncHandler(async (req, res) => {
    const {email , password , name} = req.body;

    if ([email , password , name].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await db.user.findFirst({ 
        where:{ email }
    });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    let avatarUrl = null;
    let avatarPublicId = null;
    let coverImageUrl = null;
    let coverImagePublicId = null;
    
    
    if (req.files?.avatar?.[0]?.path) {
        const avatarUpload = await uploadOnCloudinary(req.files.avatar[0].path);
        avatarUrl = avatarUpload?.url || null;
        avatarPublicId = avatarUpload?.public_id || null;
    }


    if (req.files?.coverImage?.[0]?.path) {
        const coverImageUpload = await uploadOnCloudinary(req.files.coverImage[0].path);
        coverImageUrl = coverImageUpload?.url || null;
        coverImagePublicId = coverImageUpload?.public_id || null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            avatar: avatarUrl,
            avatarPublicId,
            coverImage: coverImageUrl,
            coverImagePublicId,
            role: "USER", // default
        },
    });

    const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage,
        createdAt: user.createdAt,
    };

    return res.status(201).json(new ApiResponse(201, userResponse, "User registered successfully"));
});
